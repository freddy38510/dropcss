// credit: https://github.com/vkiryukhin/vkBeautify/blob/master/vkbeautify.js
function createShiftArr(step) {
  let space = '    ';

  if (Number.isNaN(parseInt(step, 2))) {
    // argument is string
    space = step;
  } else {
    // argument is integer
    space = ' '.repeat(step);
  }

  const shift = ['\n']; // array of shifts
  for (let ix = 0; ix < 100; ix += 1) {
    shift.push(shift[ix] + space);
  }
  return shift;
}

function vkbeautify(text, step) {
  const ar = text
    .replace(/\s{1,}/g, ' ')
    .replace(/\{/g, '{~::~')
    .replace(/\}/g, '~::~}~::~')
    .replace(/;/g, ';~::~')
    .replace(/\/\*/g, '~::~/*')
    .replace(/\*\//g, '*/~::~')
    .replace(/~::~\s{0,}~::~/g, '~::~')
    .split('~::~');
  const len = ar.length;
  let deep = 0;
  let str = '';
  let ix = 0;
  const shift = createShiftArr(step || '    ');

  for (ix = 0; ix < len; ix += 1) {
    if (/\{/.exec(ar[ix])) {
      str += shift[deep] + ar[ix];
      deep += 1;
    } else if (/\}/.exec(ar[ix])) {
      deep -= 1;
      str += shift[deep] + ar[ix];
    } else if (/\*\\/.exec(ar[ix])) {
      str += shift[deep] + ar[ix];
    } else {
      str += shift[deep] + ar[ix];
    }
  }
  return str.replace(/^\n{1,}/, '');
}

module.exports = vkbeautify;
