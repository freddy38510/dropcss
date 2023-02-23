import parseErr from './err';

const COMMENTS = /\s*\/\*[\s\S]*?\*\/\s*/gm;
const COMBINATORS = /\s*[>~+.#]\s*|\[[^\]]+\]|\s+/gm;

const START_AT = 1;
const CLOSE_AT = 2;
export const SELECTORS = 3;
const PROPERTIES = 4;
const AT_CHUNK = 5; // for @ blocks that should not be processed
// const COMMENT;

const PSEUDO_PARENTH = /:[a-z-]+\([^()]*\)/;

function stripAllPseudos(sel) {
  let olen = sel.length;

  for (;;) {
    sel = sel.replace(PSEUDO_PARENTH, '');
    if (sel.length === olen) break;
    olen = sel.length;
  }

  return sel.replace(/:?:[a-z-]+/gm, '');
}

// mission: "#a > b.c~g[a='a z'] y>.foo.bar" -> ["#a", "b", ".c", "g", "[a=a z]", "y", ".foo", ".bar"]
// selsStr e.g. "table > a, foo.bar"
function quickSels(selsStr) {
  // -> ["table > a", "foo.bar"]
  const selsArr = selsStr.split(/\s*,\s*/gm);

  const sep = '`';

  // -> ["table > a", "foo.bar", [["table", "a"], ["foo", ".bar"]]]
  selsArr.push(
    selsArr.map((sel) =>
      stripAllPseudos(sel)
        .trim()
        .replace(COMBINATORS, (m, i) => {
          m = m.trim();

          if (i === 0) {
            return m;
          }

          if (m === '.' || m === '#') {
            return sep + m;
          }

          if (m.length <= 1) {
            return sep;
          }

          return sep + m.replace(/['"]/gm, '');
        })
        .split(/`+/gm)
    )
  );

  return selsArr;
}

// pos must already be past opening @op
export function takeUntilMatchedClosing(css, pos, op, cl) {
  let chunk = '';
  let unclosed = 1;

  while (unclosed !== 0) {
    if (css[pos] === op) unclosed += 1;
    else if (css[pos] === cl) unclosed -= 1;

    if (unclosed === 0) break;

    chunk += css[pos];
    pos += 1;
  }

  return chunk;
}

function tokenize(css) {
  // TODO: dry out with selector regexes?
  const RE = {
    RULE_HEAD: /\s*([^{;]+?)\s*[{;]\s*/my,
    RULE_TAIL: /\s*([^}]*?)\s*\}/my,
    AT_TAIL: /\s*\}/my,
    RULE_FULL: /\s*([^{]*?)\{([^}]+?)\}/my,
    // COMMENT:	/\s*\/\*.*?\*\/\s*/my,
  };

  const tokens = [];
  let inAt = 0;
  let pos = 0;
  let m;

  function syncPos(re) {
    pos = re.lastIndex;

    Object.keys(RE).forEach((k) => {
      RE[k].lastIndex = pos;
    });
  }

  function next() {
    if (inAt > 0) {
      m = RE.AT_TAIL.exec(css);

      if (m !== null) {
        inAt -= 1;
        tokens.push(CLOSE_AT);
        syncPos(RE.AT_TAIL);
        return;
      }
    }

    // try to find rule start or @ start
    m = RE.RULE_HEAD.exec(css);

    if (m !== null) {
      const pre = m[1];

      syncPos(RE.RULE_HEAD);

      if (pre[0] === '@') {
        const med = pre.match(/@[a-z-]+/)[0];

        switch (med) {
          // containers (can contain selectors and other @), start with '{' and terminate on matched '}'
          case '@media':
          case '@supports':
          case '@document':
            inAt += 1;
            tokens.push(START_AT, pre);
            break;
          // inlines, terminated by ';'
          case '@import':
          case '@charset':
          case '@namespace':
            tokens.push(AT_CHUNK, `${pre};`);
            break;
          default: {
            // blobs (do not contain selectors), start with '{' and terminate on matched '}'
            //	case '@font-face':
            //	case '@keyframes':
            //	case '@page':
            //	case '@counter-style':
            //	case '@font-feature-values':
            inAt += 1;
            const chunk = takeUntilMatchedClosing(css, pos, '{', '}');
            syncPos({ lastIndex: pos + chunk.length });
            tokens.push(START_AT, pre, AT_CHUNK, chunk);
            break;
          }
        }
      } else {
        tokens.push(SELECTORS, quickSels(m[1]));
        // if cannot contain nested {}
        m = RE.RULE_TAIL.exec(css);
        tokens.push(PROPERTIES, m[1]);
        syncPos(RE.RULE_TAIL);
      }
    } else pos = css.length;
  }

  let prevPos = pos;

  while (pos < css.length) {
    next();

    if (prevPos > pos) parseErr('css', css, prevPos);

    if (prevPos === pos) parseErr('css', css, pos);

    prevPos = pos;
  }

  //	const fs = require('fs');
  //	fs.writeFileSync(__dirname + '/tokens.json', JSON.stringify(tokens, null, 2), 'utf8');

  return tokens;
}

export function parse(css) {
  // strip comments (for now)
  return tokenize(css.replace(COMMENTS, ''));
}

export function stripEmptyAts(css) {
  return css.replace(/@[a-z-]+[^{]+\{\s*\}/gm, '');
}

export function generate(tokens, didRetain) {
  let out = '';
  let lastSelsLen = 0;

  for (let i = 0; i < tokens.length; i += 1) {
    const tok = tokens[i];

    switch (tok) {
      case SELECTORS: {
        i += 1;
        const sels = tokens[i];
        lastSelsLen = sels.length;

        if (lastSelsLen > 0) {
          sels.forEach(didRetain);
          out += sels.join();
        }
        break;
      }
      case PROPERTIES:
        if (lastSelsLen > 0) {
          i += 1;
          out += `{${tokens[i]}}`;
        }
        break;
      case START_AT:
        i += 1;
        out += `${tokens[i]}{`;
        break;
      case CLOSE_AT:
        out += '}';
        break;
      case AT_CHUNK:
        i += 1;
        out += tokens[i];
        break;
      default:
        break;
    }
  }

  // strip leftover empty @ rules
  return stripEmptyAts(out);
}
