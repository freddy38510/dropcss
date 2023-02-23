/* eslint-disable func-names */
import assert from 'assert';
import dropcss from '../../src/dropcss';

describe('Context-free, unary selector', function () {
  describe('*', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div></div>',
        css: '* {a:b;}',
      });
      assert.strictEqual(css, '*{a:b;}');
    });
  });

  describe('<tag>', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div></div>',
        css: 'div {a:b;}',
      });
      assert.strictEqual(css, 'div{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div></div>',
        css: 'span {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('#id', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div id="a"></div>',
        css: '#a {a:b;}',
      });
      assert.strictEqual(css, '#a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div id="a"></div>',
        css: '#b {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('.class', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="a"></div>',
        css: '.a {a:b;}',
      });
      assert.strictEqual(css, '.a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div class="a"></div>',
        css: '.b {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('[attr]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: '[foo] {a:b;}',
      });
      assert.strictEqual(css, '[foo]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: '[bar] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  // todo: test [foo="val"], [foo='val']
  describe('[attr=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo=bar] {a:b;}',
      });
      assert.strictEqual(css, '[foo=bar]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo=cow] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('[attr*=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo*=a] {a:b;}',
      });
      assert.strictEqual(css, '[foo*=a]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo*=c] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('[attr^=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo^=b] {a:b;}',
      });
      assert.strictEqual(css, '[foo^=b]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo^=c] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('[attr$=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo$=r] {a:b;}',
      });
      assert.strictEqual(css, '[foo$=r]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo$=z] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('[attr~=value]', function () {
    it('should retain present', function () {
      let { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '[foo~=bar] {a:b;}',
      });
      assert.strictEqual(css, '[foo~=bar]{a:b;}');

      ({ css } = dropcss({
        html: '<div foo="bar baz"></div>',
        css: '[foo~=bar] {a:b;}',
      }));
      assert.strictEqual(css, '[foo~=bar]{a:b;}');
    });

    it('should drop absent', function () {
      let { css } = dropcss({
        html: '<div foo="bar-baz"></div>',
        css: '[foo~=bar] {a:b;}',
      });
      assert.strictEqual(css, '');

      ({ css } = dropcss({
        html: '<div foo="baz-bar"></div>',
        css: '[foo~=bar] {a:b;}',
      }));
      assert.strictEqual(css, '');
    });
  });

  describe(':not(<tag>)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div></div>',
        css: ':not(span) {a:b;}',
      });
      assert.strictEqual(css, ':not(span){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div></div>',
        css: ':not(div) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':not(#id)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div id="a"></div>',
        css: ':not(#b) {a:b;}',
      });
      assert.strictEqual(css, ':not(#b){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div id="a"></div>',
        css: ':not(#a) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':not(.class)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="a"></div>',
        css: ':not(.b) {a:b;}',
      });
      assert.strictEqual(css, ':not(.b){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div class="a"></div>',
        css: ':not(.a) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':not([attr])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: ':not([bar]) {a:b;}',
      });
      assert.strictEqual(css, ':not([bar]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: ':not([foo]) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  // todo: test [foo="val"], [foo='val']
  describe(':not([attr=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo=cow]) {a:b;}',
      });
      assert.strictEqual(css, ':not([foo=cow]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo=bar]) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':not([attr*=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo*=c]) {a:b;}',
      });
      assert.strictEqual(css, ':not([foo*=c]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo*=a]) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':not([attr^=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo^=c]) {a:b;}',
      });
      assert.strictEqual(css, ':not([foo^=c]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo^=b]) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':not([attr$=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo$=z]) {a:b;}',
      });
      assert.strictEqual(css, ':not([foo$=z]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':not([foo$=r]) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':is(<tag>)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div></div>',
        css: ':is(div) {a:b;}',
      });
      assert.equal(css, ':is(div){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div></div>',
        css: ':is(span) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  describe(':is(#id)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div id="a"></div>',
        css: ':is(#a) {a:b;}',
      });
      assert.equal(css, ':is(#a){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div id="a"></div>',
        css: ':is(#b) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  describe(':is(.class)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="a"></div>',
        css: ':is(.a) {a:b;}',
      });
      assert.equal(css, ':is(.a){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div class="a"></div>',
        css: ':is(.b) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  describe(':is([attr])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: ':is([foo]) {a:b;}',
      });
      assert.equal(css, ':is([foo]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: ':is([bar]) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  // todo: test [foo="val"], [foo='val']
  describe(':is([attr=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo=bar]) {a:b;}',
      });
      assert.equal(css, ':is([foo=bar]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo=cow]) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  describe(':is([attr*=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo*=a]) {a:b;}',
      });
      assert.equal(css, ':is([foo*=a]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo*=c]) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  describe(':is([attr^=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo^=b]) {a:b;}',
      });
      assert.equal(css, ':is([foo^=b]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo^=c]) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  describe(':is([attr$=value])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo$=r]) {a:b;}',
      });
      assert.equal(css, ':is([foo$=r]){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':is([foo$=z]) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  describe(':where(<tag>)', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div></div>',
        css: ':where(div) {a:b;}',
      });
      assert.equal(out, ':where(div){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div></div>',
        css: ':where(span) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  describe(':where(#id)', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div id="a"></div>',
        css: ':where(#a) {a:b;}',
      });
      assert.equal(out, ':where(#a){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div id="a"></div>',
        css: ':where(#b) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  describe(':where(.class)', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div class="a"></div>',
        css: ':where(.a) {a:b;}',
      });
      assert.equal(out, ':where(.a){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div class="a"></div>',
        css: ':where(.b) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  describe(':where([attr])', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div foo></div>',
        css: ':where([foo]) {a:b;}',
      });
      assert.equal(out, ':where([foo]){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div foo></div>',
        css: ':where([bar]) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  // todo: test [foo="val"], [foo='val']
  describe(':where([attr=value])', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo=bar]) {a:b;}',
      });
      assert.equal(out, ':where([foo=bar]){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo=cow]) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  describe(':where([attr*=value])', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo*=a]) {a:b;}',
      });
      assert.equal(out, ':where([foo*=a]){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo*=c]) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  describe(':where([attr^=value])', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo^=b]) {a:b;}',
      });
      assert.equal(out, ':where([foo^=b]){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo^=c]) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  describe(':where([attr$=value])', function () {
    it('should retain present', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo$=r]) {a:b;}',
      });
      assert.equal(out, ':where([foo$=r]){a:b;}');
    });

    it('should drop absent', function () {
      const { css: out } = dropcss({
        html: '<div foo="bar"></div>',
        css: ':where([foo$=z]) {a:b;}',
      });
      assert.equal(out, '');
    });
  });

  // *-child assertions dont make to test in a unary selector since all root elements will be first/last/only "children"
});
