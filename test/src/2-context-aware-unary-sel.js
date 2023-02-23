/* eslint-disable func-names */
import assert from 'assert';
import dropcss from '../../src/dropcss';

describe('Context-aware, unary selector', function () {
  describe('<tag>', function () {
    it('should retain present', function () {
      let { css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'div a {a:b;}',
      });
      assert.strictEqual(css, 'div a{a:b;}');

      ({ css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'span a {a:b;}',
      }));
      assert.strictEqual(css, 'span a{a:b;}');

      ({ css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'div span a {a:b;}',
      }));
      assert.strictEqual(css, 'div span a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'span div {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('>', function () {
    it('should retain present', function () {
      let { css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'div > span {a:b;}',
      });
      assert.strictEqual(css, 'div > span{a:b;}');

      ({ css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'span > a {a:b;}',
      }));
      assert.strictEqual(css, 'span > a{a:b;}');

      ({ css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'div > span > a {a:b;}',
      }));
      assert.strictEqual(css, 'div > span > a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><span><a></a></span></div>',
        css: 'div > a {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('+', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><span></span><a></a></div>',
        css: 'span + a {a:b;}',
      });
      assert.strictEqual(css, 'span + a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><span></span><a></a></div>',
        css: 'a + span {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('~', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><i></i><span></span><a></a></div>',
        css: 'i ~ a {a:b;}',
      });
      assert.strictEqual(css, 'i ~ a{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><i></i><span></span><a></a></div>',
        css: 'a ~ i {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':nth-child()', function () {
    it('should retain "odd"', function () {
      const { css } = dropcss({
        html: '<div><span></span></div>',
        css: 'span:nth-child(odd) {a:b;}',
      });
      assert.strictEqual(css, 'span:nth-child(odd){a:b;}');
    });

    it('should retain "2n+1"', function () {
      const { css } = dropcss({
        html: '<div><span></span></div>',
        css: 'span:nth-child(2n+1) {a:b;}',
      });
      assert.strictEqual(css, 'span:nth-child(2n+1){a:b;}');
    });

    it('should retain "1"', function () {
      const { css } = dropcss({
        html: '<div><span></span><i></i></div>',
        css: 'span:nth-child(1) {a:b;}',
      });
      assert.strictEqual(css, 'span:nth-child(1){a:b;}');
    });

    it('should drop "even"', function () {
      const { css } = dropcss({
        html: '<div><span></span></div>',
        css: 'span:nth-child(even) {a:b;}',
      });
      assert.strictEqual(css, '');
    });

    it('should drop "2"', function () {
      const { css } = dropcss({
        html: '<div><span></span><i></i></div>',
        css: 'span:nth-child(2) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':nth-last-child()', function () {
    it('should retain "2n+1"', function () {
      const { css } = dropcss({
        html: '<div><span></span></div>',
        css: 'span:nth-last-child(2n+1) {a:b;}',
      });
      assert.strictEqual(css, 'span:nth-last-child(2n+1){a:b;}');
    });
  });

  describe(':first-child', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><span></span><a></a></div>',
        css: 'span:first-child {a:b;}',
      });
      assert.strictEqual(css, 'span:first-child{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><span></span><a></a></div>',
        css: 'a:first-child {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':only-child', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><span></span></div>',
        css: 'span:only-child {a:b;}',
      });
      assert.strictEqual(css, 'span:only-child{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><span></span><span></span></div>',
        css: 'span:only-child {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });
});
