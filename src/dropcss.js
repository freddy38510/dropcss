import { parse as parseHTML } from './html';
import {
  parse as parseCSS,
  generate as generateCSS,
  SELECTORS,
  stripEmptyAts,
} from './css';
import { some, matchesAttr } from './find';
import postProc from './postproc';
import LOGGING from './env';

const ATTRIBUTES = /\[([\w-]+)(?:(.?=)"?([^\]]*?)"?)?\]/i;

const pseudoAssertable = /:(?:first|last|nth|only|not|is|has|where)\b/;

const pseudoNonAssertableParenth = /:(?:lang)\([^)]*\)/g;

// strips pseudo-elements and transient pseudo-classes
function stripNonAssertablePseudos(sel) {
  return (
    sel
      .replace(pseudoNonAssertableParenth, '')
      .replace(/:?:[a-z-]+/gm, (m) =>
        m.startsWith('::') || !pseudoAssertable.test(m) ? '' : m
      )
      // remove any empty leftovers eg :not() - [tabindex="-1"]:focus:not(:focus-visible)
      .replace(/:[a-z-]+\(\)/gm, '')
  );
}

const retTrue = () => true;

export default function dropcss(opts) {
  let log;
  let START;

  if (LOGGING) {
    START = +new Date();
    log = [[0, 'Start']];
  }

  // {nodes, tag, class, id}
  const H = parseHTML(opts.html, !opts.keepText);

  if (LOGGING) log.push([+new Date() - START, 'HTML parsed & processed']);

  const dropUsedFontFace = opts.dropUsedFontFace || false;
  const dropUsedKeyframes = opts.dropUsedKeyframes || false;

  const shouldDrop = opts.shouldDrop || retTrue;
  const didRetain = opts.didRetain || retTrue;

  const tokens = parseCSS(opts.css);

  if (LOGGING) log.push([+new Date() - START, 'CSS tokenized']);

  // cache
  const tested = {};

  // null out tokens that have any unmatched sub-selectors in flat dom
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token === SELECTORS) {
      const sels = tokens[i + 1];
      const sels2 = sels[sels.length - 1];

      i += 1;

      for (let j = 0; j < sels2.length; j += 1) {
        const subs = sels2[j];

        for (let k = 0; k < subs.length; k += 1) {
          const sub = subs[k];
          let hasOne = false;
          let name;

          if (sub !== '') {
            // cache
            if (sub in tested) hasOne = tested[sub];
            else {
              // hehe Sub-Zero :D
              switch (sub[0]) {
                case '#':
                  name = sub.substr(1);
                  hasOne = H.attr.has(`[id=${name}]`);
                  tested[sub] = hasOne;
                  break;
                case '.':
                  name = sub.substr(1);
                  hasOne = H.class.has(name);
                  tested[sub] = hasOne;
                  break;
                case '[':
                  // [type=...] is super common in css, so it gets special fast-path treatment, which is a large perf win
                  if (sub.startsWith('[type=')) {
                    hasOne = H.attr.has(sub);
                    tested[sub] = hasOne;
                  } else {
                    const m = sub.match(ATTRIBUTES);
                    hasOne = H.nodes.some((el) =>
                      matchesAttr(el, m[1], m[3], m[2])
                    );
                    tested[sub] = hasOne;
                  }
                  break;
                default:
                  hasOne = H.tag.has(sub);
                  tested[sub] = hasOne;
              }
            }

            if (!hasOne) {
              if (shouldDrop(sels[j]) === true) sels[j] = null;
              else tested[sels[j]] = true; // should this be pseudo-stripped?
              break;
            }
          }
        }
      }
    }
  }

  if (LOGGING) log.push([+new Date() - START, 'Context-free first pass']);

  for (let i = 0; i < tokens.length; i += 1) {
    const tok = tokens[i];

    if (tok === SELECTORS) {
      i += 1;
      // const len = tokens[i].length;
      tokens[i] = tokens[i].filter((s) => {
        if (typeof s === 'string') {
          if (s in tested) return tested[s];

          const cleaned = stripNonAssertablePseudos(s);

          if (cleaned === '') {
            if (s.startsWith(':')) {
              // call shouldDrop on pseudo selectors/classes at root level if html is blank
              // usefull to purge with a whitelist
              return H.nodes.length > 0 || shouldDrop(s) !== true;
            }
            return true;
          }

          if (cleaned in tested) return tested[cleaned];

          tested[cleaned] = some(H.nodes, cleaned) || shouldDrop(s) !== true;

          return tested[cleaned];
        }

        return false;
      });
    }
  }

  if (LOGGING) log.push([+new Date() - START, 'Context-aware second pass']);

  let out = generateCSS(tokens, didRetain);

  if (LOGGING) log.push([+new Date() - START, 'Generate output']);

  out = postProc(
    out,
    dropUsedFontFace,
    dropUsedKeyframes,
    shouldDrop,
    log,
    START
  );

  // eslint-disable-next-line no-console
  if (LOGGING) log.forEach((e) => console.log(e[0], e[1]));

  return {
    css: stripEmptyAts(out),
  };
}
