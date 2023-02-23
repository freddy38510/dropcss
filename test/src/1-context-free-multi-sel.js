/* eslint-disable func-names */
import assert from 'assert';
import dropcss from '../../src/dropcss';

describe('Context-free, multi selector', function () {
  describe('<tag>.class', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="foo"></div>',
        css: 'div.foo {a:b;}',
      });
      assert.strictEqual(css, 'div.foo{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<i class="foo"></i>',
        css: 'div.foo {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('<tag>#id', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div id="a"></div>',
        css: 'div#a {a:b;}',
      });
      assert.strictEqual(css, 'div#a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<i id="a"></i>',
        css: 'div#a {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('.class.class', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="a b"></div>',
        css: '.b.a {a:b;}',
      });
      assert.strictEqual(css, '.b.a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div class="a z"></div>',
        css: '.b.a {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('#id.class', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="a" id="foo"></div>',
        css: '#foo.a {a:b;}',
      });
      assert.strictEqual(css, '#foo.a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div class="a"></div>',
        css: '#foo.a {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('<tag>[attr]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: 'div[foo] {a:b;}',
      });
      assert.strictEqual(css, 'div[foo]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo></div>',
        css: 'i[foo] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  // todo: test [foo="val"], [foo='val']
  describe('.class[attr=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="z" foo="bar"></div>',
        css: '.z[foo=bar] {a:b;}',
      });
      assert.strictEqual(css, '.z[foo=bar]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: '.z[foo=bar] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('[attr*=value][attr*=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar" moo="cow"></div>',
        css: '[foo*=a][moo*=w] {a:b;}',
      });
      assert.strictEqual(css, '[foo*=a][moo*=w]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar" moo="cow"></div>',
        css: '[foo*=a][baz*=w] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('.class[attr^=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="z" foo="bar"></div>',
        css: '.z[foo^=b] {a:b;}',
      });
      assert.strictEqual(css, '.z[foo^=b]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div class="z" foo="bar"></div>',
        css: '[foo^=c] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('<tag>[attr$=value]', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: 'div[foo$=r] {a:b;}',
      });
      assert.strictEqual(css, 'div[foo$=r]{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div foo="bar"></div>',
        css: 'div[foo$=z] {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('<tag>:not(.class)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="bar"></div>',
        css: 'div:not(.foo) {a:b;}',
      });
      assert.strictEqual(css, 'div:not(.foo){a:b;}');
    });

    it('should drop absent', function () {
      let { css } = dropcss({
        html: '<div class="foo"></div><i></i>',
        css: 'div:not(.foo) {a:b;}',
      });
      assert.strictEqual(css, '');

      ({ css } = dropcss({
        html: '<i></i>',
        css: 'div:not(.foo) {a:b;}',
      }));
      assert.strictEqual(css, '');
    });
  });

  describe('<tag>:not(:nth-child(n+3))', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><p></p><p></p><p></p><p></p></div>',
        css: 'p:not(:nth-child(n+3)) {a:b;}',
      });
      assert.strictEqual(css, 'p:not(:nth-child(n+3)){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><i></i><i></i><p></p><p></p></div>',
        css: 'p:not(:nth-child(n+3)) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('<tag>:is(.class)', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div class="bar"></div>',
        css: 'div:is(.bar) {a:b;}',
      });
      assert.equal(css, 'div:is(.bar){a:b;}');
    });

    it('should drop absent', function () {
      let { css } = dropcss({
        html: '<div class="foo"></div><i></i>',
        css: 'div:is(.bar) {a:b;}',
      });
      assert.equal(css, '');

      ({ css } = dropcss({
        html: '<i></i>',
        css: 'div:is(.foo) {a:b;}',
      }));
      assert.equal(css, '');

      ({ css } = dropcss({
        html: '<i></i>',
        css: 'div:is(.foo) {a:b;}',
      }));
      assert.equal(css, '');
    });
  });

  describe('<tag>:is(:nth-child(n+3))', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><p></p><p></p><p></p><p></p></div>',
        css: 'p:is(:nth-child(n+3)) {a:b;}',
      });
      assert.equal(css, 'p:is(:nth-child(n+3)){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><i></i><i></i><p></p><p></p></div>',
        css: 'p:is(:nth-child(n+5)) {a:b;}',
      });
      assert.equal(css, '');
    });
  });

  // TODO: rest that match the non-:not() versions

  // *-child assertions dont make to test in a unary selector since all root elements will be first/last/only "children"
});
