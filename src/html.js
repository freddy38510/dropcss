/* eslint-disable no-underscore-dangle */
import parseErr from './err';

const TAG_OPEN = 1;
const ATTRS = 2;
const TAG_CLOSE = 3;

const VOIDS = new Set(
  'area base br col command embed hr img input keygen link meta param source track wbr'.split(
    ' '
  )
);

// doctype, comments, meta, style, link & script tags. TODO: CDATA
const NASTIES =
  /<!doctype[^>]*>|<!--[\s\S]*?-->|<script[^>]*>[\s\S]*?<\/script>|<style[^>]*>[\s\S]*?<\/style>|<link\s+[^>]*>|<meta\s+[^>]*>/gim;
const RE = {
  NAME: /\s*<([\w-]+)\s*/imy,
  ATTR: /\s*([\w-:]+)(?:="([^"]*)"|='([^']*)'|=([\w-/]+))?\s*/imy,
  TAIL: /\s*(\/?>)\s*/imy,
  TEXT: /\s*[^<]*/my,
  CLOSE: /\s*<\/[\w-]+\s*>\s*/imy,
};

function tokenize(html) {
  const tokens = [];
  let pos = 0;
  let m;
  let m2;

  function syncPos(re) {
    pos = re.lastIndex;
    Object.keys(RE).forEach((k) => {
      RE[k].lastIndex = pos;
    });
  }

  function next() {
    m = RE.CLOSE.exec(html);

    if (m !== null) {
      syncPos(RE.CLOSE);
      tokens.push(TAG_CLOSE);
      return;
    }

    m = RE.NAME.exec(html);

    if (m !== null) {
      syncPos(RE.NAME);
      const tag = m[1];
      tokens.push(TAG_OPEN, tag);

      let attrMap;

      while ((m2 = RE.ATTR.exec(html))) {
        syncPos(RE.ATTR);
        attrMap = attrMap || new Map();
        attrMap.set(m2[1], (m2[2] || m2[3] || m2[4] || '').trim());
      }

      if (attrMap) tokens.push(ATTRS, attrMap);

      m2 = RE.TAIL.exec(html);

      if (VOIDS.has(tag) || m2[1] === '/>') tokens.push(TAG_CLOSE);

      syncPos(RE.TAIL);

      return;
    }

    m = RE.TEXT.exec(html);

    if (m !== null) syncPos(RE.TEXT);
  }

  let prevPos = pos;

  while (pos < html.length) {
    next();

    if (prevPos > pos) parseErr('html', html, prevPos);

    if (prevPos === pos) parseErr('html', html, pos);

    prevPos = pos;
  }

  syncPos({ lastIndex: 0 });

  return tokens;
}

const EMPTY_SET = new Set();

// TODO: lazy attrs, classList. then test tagNames first to reduce chance of triggering getters
function createNode(parent, tagName, attrs) {
  return {
    tagName,
    attributes: attrs,
    classList:
      attrs !== null && attrs.has('class')
        ? new Set(attrs.get('class').split(/\s+/g))
        : EMPTY_SET,
    parentNode: parent,
    childNodes: [],
  };
}

const EMPTY_ARR = [];

// adds ._ofTypes: {<tagName>: [...]} to parent
// adds ._typeIdx to childNodes
export function getSibsOfType(par, tagName) {
  if (par !== null) {
    par._ofTypes = par._ofTypes || {};

    if (!(tagName in par._ofTypes)) {
      let typeIdx = 0;
      par._ofTypes[tagName] = par.childNodes.filter((n) => {
        if (n.tagName === tagName) {
          n._typeIdx = typeIdx;
          typeIdx += 1;

          return true;
        }

        return false;
      });
    }

    return par._ofTypes[tagName];
  }

  return EMPTY_ARR;
}

function build(tokens, each) {
  let targ = createNode(null, 'root', EMPTY_SET);
  let idx;

  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];

    switch (t) {
      case TAG_OPEN: {
        i += 1;
        const tag = tokens[i];

        let attrs = EMPTY_SET;

        if (tokens[i + 1] === ATTRS) {
          i += 2;
          attrs = tokens[i];
        }

        idx = targ.childNodes.length;
        targ.childNodes.push((targ = createNode(targ, tag, attrs)));
        each(targ, idx);
        break;
      }
      //	case ATTRS:
      //		break;
      case TAG_CLOSE:
        targ = targ.parentNode;
        break;

      default:
        break;
    }
  }

  return targ;
}

function postProc(node, idx, ctx) {
  // add index for fast positional testing, e.g. :nth-child
  node.idx = idx;

  const attrs = node.attributes;

  // cache seen tags, classes & ids
  ctx.tag.add(node.tagName);
  node.classList.forEach((v) => ctx.class.add(v));
  /*
	for (let a in attrs) {
		ctx.attr.add('['+a+']');
		ctx.attr.add('['+a+'='+attrs[a]+']');
	}
*/
  if (attrs.has('id')) ctx.attr.add(`[id=${attrs.get('id')}]`);
  if (attrs.has('type')) ctx.attr.add(`[type=${attrs.get('type')}]`);

  // append to flat node list
  ctx.nodes.push(node);
}

export const parse = (html) => {
  html = html.replace(NASTIES, '');

  const tokens = tokenize(html);

  const ctx = {
    nodes: [],
    tag: html === '' ? new Set() : new Set(['*']),
    class: new Set(),
    attr: new Set(),
  };

  build(tokens, (node, idx) => postProc(node, idx, ctx));

  return ctx;
};
