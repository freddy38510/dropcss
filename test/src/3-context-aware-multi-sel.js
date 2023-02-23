/* eslint-disable func-names */
import assert from 'assert';
import dropcss from '../../src/dropcss';

/* e.g.

.x .y + a:not(.y)
.foo > bar:not([foo*=z])

*/

describe('Context-aware, multi selector', function () {
  describe(':first-of-type', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><img><span class="foo"></span><img></div>',
        css: '.foo:first-of-type {a:b;}',
      });
      assert.strictEqual(css, '.foo:first-of-type{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><img><span class="bar"></span><img><span class="foo"></span><img></div>',
        css: '.foo:first-of-type {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':last-of-type', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><img><span class="bar"></span><span class="foo"></span><img></div>',
        css: '.foo:last-of-type {a:b;}',
      });
      assert.strictEqual(css, '.foo:last-of-type{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><img><span class="foo"></span><img><span class="bar"></span><img></div>',
        css: '.foo:last-of-type {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':only-of-type', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><img><span class="foo"></span><img></div>',
        css: '.foo:only-of-type {a:b;}',
      });
      assert.strictEqual(css, '.foo:only-of-type{a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><img><span class="foo"></span><img><span class="foo"></span><img></div>',
        css: '.foo:only-of-type {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':nth-of-type()', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><img><span class="bar"></span><img><span class="foo"></span><img></div>',
        css: '.foo:nth-of-type(2) {a:b;}',
      });
      assert.strictEqual(css, '.foo:nth-of-type(2){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><img><span class="foo"></span><img><span class="bar"></span><img></div>',
        css: '.foo:nth-of-type(2) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe(':nth-last-of-type()', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<div><img><span class="bar"></span><img><span class="foo"></span><img></div>',
        css: '.foo:nth-last-of-type(1) {a:b;}',
      });
      assert.strictEqual(css, '.foo:nth-last-of-type(1){a:b;}');
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<div><img><span class="foo"></span><img><span class="bar"></span><img></div>',
        css: '.foo:nth-last-of-type(1) {a:b;}',
      });
      assert.strictEqual(css, '');
    });
  });

  describe('<tag> <tag>:not([a]):not([b])', function () {
    it('should retain present', function () {
      const { css } = dropcss({
        html: '<body><input></body>',
        css: "body input:not([type='color']):not([type='checkbox']) {a:b;}",
      });
      assert.strictEqual(
        css,
        "body input:not([type='color']):not([type='checkbox']){a:b;}"
      );
    });

    it('should drop absent', function () {
      const { css } = dropcss({
        html: '<body><input type="color"></body>',
        css: "body input:not([type='color']):not([type='checkbox']) {a:b;}",
      });
      assert.strictEqual(css, '');
    });
  });

  describe('a:lang(ar)', function () {
    it('should handle unsupported pseudo in selector parser', function () {
      const { css } = dropcss({
        html: '<a></a>',
        css: 'a:lang(ar){color:red;}',
      });
      assert.equal(css, 'a:lang(ar){color:red;}');
    });
  });
});
