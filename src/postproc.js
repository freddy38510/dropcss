import LOGGING from './env';
import { takeUntilMatchedClosing } from './css';

function splice(str, index, count, add) {
  return str.slice(0, index) + add + str.slice(index + count);
}

function removeBackwards(css, defs, used, shouldDrop, type) {
  type = type || '';

  for (let i = defs.length - 1; i > -1; i -= 1) {
    const d = defs[i];

    if (!used.has(d[2]) && shouldDrop(type + d[2]) === true)
      css = splice(css, d[0], d[1], '');
  }

  return css;
}

const CUSTOM_PROP_DEF = /([{};])\s*(--[\w-]+)\s*:\s*([^;}]+);?\s*/gm;
const CUSTOM_PROP_USE = /var\(([\w-]+)\)/gm;
const COMMA_SPACED = /\s*,\s*/gm;

function resolveCustomProps(css) {
  const defs = {};
  let m;

  // while var(--*) patterns exist
  while (CUSTOM_PROP_USE.test(css)) {
    // get all defs
    // eslint-disable-next-line prefer-destructuring
    while ((m = CUSTOM_PROP_DEF.exec(css))) defs[m[2]] = m[3];

    // replace any non-composites
    css = css.replace(CUSTOM_PROP_USE, (m0, m1) =>
      !CUSTOM_PROP_USE.test(defs[m1]) ? defs[m1] : m0
    );
  }

  return css;
}

function dropKeyFrames(css, flatCss, shouldDrop, dropUsedKeyframes) {
  // defined
  const defs = [];

  const RE = /@(?:-\w+-)?keyframes\s+([\w-]+)\s*\{/gm;
  let m;

  while ((m = RE.exec(css))) {
    const ch = takeUntilMatchedClosing(css, RE.lastIndex, '{', '}');
    defs.push([m.index, m[0].length + ch.length + 1, m[1]]);
  }

  // used
  const used = new Set();

  if (!dropUsedKeyframes) {
    const RE2 = /animation(?:-name)?:([^;!}]+)/gm;

    while ((m = RE2.exec(flatCss))) {
      m[1]
        .trim()
        .split(COMMA_SPACED)
        .forEach((a) => {
          let keyFramesName = a.match(/^\S+/)[0];

          if (/^-?[\d.]+m?s/.test(keyFramesName))
            [keyFramesName] = a.match(/\S+$/);

          used.add(keyFramesName);
        });
    }
  }

  return removeBackwards(css, defs, used, shouldDrop, '@keyframes ');
}

function cleanFontFam(fontFam) {
  return fontFam.trim().replace(/'|"/gm, '').split(COMMA_SPACED);
}

function dropFontFaces(css, flatCss, shouldDrop, dropUsedFontFace) {
  // defined
  const gm = 'gm';
  const re00 = '@font-face[^}]+\\}+';
  const RE00 = RegExp(re00, gm);
  let m;

  // get all @font-face blocks in original css
  const defs = [];

  while ((m = RE00.exec(css))) defs.push([m.index, m[0].length]);

  const re01 = 'font-family:([^;!}]+)';
  const RE01 = RegExp(re01);
  let m2;
  let i = 0;

  // get all @font-face blocks in resolved css
  while ((m = RE00.exec(flatCss))) {
    m2 = RE01.exec(m[0]);
    defs[i].push(cleanFontFam(m2[1])[0]);
    i += 1;
  }

  // used
  const used = new Set();

  if (!dropUsedFontFace) {
    const RE02 = RegExp(`${re00}|${re01}`, gm);

    while ((m = RE02.exec(flatCss))) {
      if (m[0][0] !== '@') cleanFontFam(m[1]).forEach((a) => used.add(a));
    }

    const RE03 = /font:([^;!}]+)/gm;
    const RE04 = /\s*(?:['"][\w- ]+['"]|[\w-]+)\s*(?:,|$)/gm;
    let t;

    while ((m = RE03.exec(flatCss))) {
      t = '';
      while ((m2 = RE04.exec(m[1]))) t += m2[0];

      cleanFontFam(t).forEach((a) => used.add(a));
    }
  }

  return removeBackwards(css, defs, used, shouldDrop, '@font-face ');
}

function dropCssVars(css, shouldDrop) {
  let css2 = css;

  do {
    css = css2;
    // eslint-disable-next-line no-loop-func
    css2 = css.replace(CUSTOM_PROP_DEF, (m, m1, m2) =>
      css.indexOf(`var(${m2})`) === -1 && shouldDrop(m2) === true ? m1 : m
    );
  } while (css2 !== css);

  return css2;
}

export default function postProc(
  out,
  dropUsedFontFace,
  dropUsedKeyframes,
  shouldDrop,
  log,
  START
) {
  // flatten & remove custom props to ensure no accidental
  // collisions for regexes, e.g. --animation-name: --font-face:
  // this is used for testing for "used" keyframes and fonts and
  // parsing resolved 'font-family:' names from @font-face defs,
  // so does not need to be regenerated during iterative purging
  const flatCss = resolveCustomProps(out).replace(
    CUSTOM_PROP_DEF,
    (m, m1) => m1
  );

  out = dropKeyFrames(out, flatCss, shouldDrop, dropUsedKeyframes);

  if (LOGGING) log.push([+new Date() - START, 'Drop unused @keyframes']);

  out = dropFontFaces(out, flatCss, shouldDrop, dropUsedFontFace);

  if (LOGGING) log.push([+new Date() - START, 'Drop unused @font-face']);

  out = dropCssVars(out, shouldDrop);

  if (LOGGING) log.push([+new Date() - START, 'Drop unused --* props']);

  // kill any leftover empty blocks e.g. :root {}
  return out.replace(/[^{}]+\{\s*\}/gm, '');
}
