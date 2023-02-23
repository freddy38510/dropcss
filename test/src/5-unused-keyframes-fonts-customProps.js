/* eslint-disable func-names */
import assert from 'assert';
import dropcss from '../../src/dropcss';

describe('Unused @keyframes and @font-face', function () {
  describe('@keyframes', function () {
    const css = `
			div{color: red;}
			@keyframes pulse{0%{width:300%;}100%{width:100%;}}
			@-webkit-keyframes pulse{0%{width:300%;}100%{width:100%;}}
			@keyframes nudge{0%{width:300%;}100%{width:100%;}}
			@-webkit-keyframes nudge{0%{width:300%;}100%{width:100%;}}
			@keyframes bop{0%{width:300%;}100%{width:100%;}}
			@-webkit-keyframes bop{0%{width:300%;}100%{width: 100%;}}
			span{color: black;}
		`;

    it('should drop all', function () {
      const prepend = '';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(out, `${prepend}div{color: red;}`);
    });

    it('should drop pulse, nudge', function () {
      const prepend = 'div{animation-name: bop;}';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(
        out,
        `${prepend}div{color: red;}@keyframes bop{0%{width:300%;}100%{width:100%;}}@-webkit-keyframes bop{0%{width:300%;}100%{width: 100%;}}`
      );
    });

    it('should drop bop', function () {
      const prepend =
        'div{animation: pulse 3s ease infinite alternate, nudge 5s linear infinite alternate;}';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(
        out,
        `${prepend}div{color: red;}@keyframes pulse{0%{width:300%;}100%{width:100%;}}@-webkit-keyframes pulse{0%{width:300%;}100%{width:100%;}}@keyframes nudge{0%{width:300%;}100%{width:100%;}}@-webkit-keyframes nudge{0%{width:300%;}100%{width:100%;}}`
      );
    });

    it('should retain nudge', function () {
      const prepend =
        'div{animation: foo 3s ease infinite alternate, nudge 5s linear infinite alternate;}';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(
        out,
        `${prepend}div{color: red;}@keyframes nudge{0%{width:300%;}100%{width:100%;}}@-webkit-keyframes nudge{0%{width:300%;}100%{width:100%;}}`
      );
    });
  });

  describe('@font-face', function () {
    const css =
      "div{color: red;}@font-face{font-family: 'Open Sans';}span{color: black;}";

    it('should retain if used', function () {
      const prepend = "div{font-family: 'Open Sans', Fallback, sans-serif;}";

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(
        out,
        `${prepend}div{color: red;}@font-face{font-family: 'Open Sans';}`
      );
    });

    it('should retain if used (shorthand)', function () {
      const prepend =
        "div{font: italic small-caps normal 13px Arial, 'Open Sans', Helvetica, sans-serif;}";

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(
        out,
        `${prepend}div{color: red;}@font-face{font-family: 'Open Sans';}`
      );
    });

    it('should drop if unused', function () {
      const prepend = '';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(out, `${prepend}div{color: red;}`);
    });

    it('should drop if unused (multiple defs)', function () {
      const prepend =
        '@font-face{font-family:MuseoSans;}@font-face{font-family:MuseoSans;}';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(out, 'div{color: red;}');
    });
  });

  describe('@font-face (custom props)', function () {
    const css =
      "div{color: red;}:root {--font-family: Foo, 'Bar Baz';}@font-face {font-family: Foo}";

    it('should drop if unused (--font-family: should not be confused with font use)', function () {
      const prepend = '';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(out, `${prepend}div{color: red;}`);
    });

    it('should retain if used in font-family:', function () {
      const prepend = 'div{font-family: var(--font-family);}';

      const { css: out } = dropcss({
        html: '<div></div>',
        css: prepend + css,
      });
      assert.strictEqual(
        out,
        `${prepend}div{color: red;}:root{--font-family: Foo, 'Bar Baz';}@font-face{font-family: Foo}`
      );
    });

    it('should retain if used (deep resolve)', function () {
      const css2 = [
        ":root {--font: var(--sty) var(--wgt) 1em/var(--lht) var(--fam1), var(--fam2); --sty: italic; --wgt: bold; --lht: var(--hgt)em; --fam1: 'Open Sans'; --fam2: Arial; --hgt: 1.6;}",
        '@font-face {font-family: var(--fam1);}',
        'div {font: var(--font);}',
      ].join('');

      const { css: out } = dropcss({
        html: '<div></div>',
        css: css2,
      });
      assert.strictEqual(
        out,
        ":root{--font: var(--sty) var(--wgt) 1em/var(--lht) var(--fam1), var(--fam2); --sty: italic; --wgt: bold; --lht: var(--hgt)em; --fam1: 'Open Sans'; --fam2: Arial; --hgt: 1.6;}@font-face{font-family: var(--fam1);}div{font: var(--font);}"
      );
    });

    it('should drop if unused (deep resolve)', function () {
      const css2 = [
        ":root {--font: var(--sty) var(--wgt) 1em/var(--lht) var(--fam1), var(--fam2); --sty: italic; --wgt: bold; --lht: var(--hgt)em; --fam1: 'Open Sans'; --fam2: Arial; --hgt: 1.6;}",
        '@font-face {font-family: var(--fam1);}',
        //	"div {font: var(--font);}",
      ].join('');

      const { css: out } = dropcss({
        html: '<div></div>',
        css: css2,
      });
      assert.strictEqual(out, '');
    });
  });

  describe('custom props', function () {
    it('should not confuse BEM -- classes with custom props', function () {
      const css =
        ':root{--red: #f00;}.a--b:hover{color: var(--red);}.--c{width: 10px;}';

      const { css: out } = dropcss({
        html: '<div class="a--b"></div><div class="--c"></div>',
        css,
      });
      assert.strictEqual(out, css);
    });

    it('should retain if used', function () {
      const css = ':root{--red: #f00;}div{color: var(--red);}';

      const { css: out } = dropcss({
        html: '<div></div>',
        css,
      });
      assert.strictEqual(out, css);
    });

    it('should drop if unused', function () {
      const { css: out } = dropcss({
        html: '<div></div>',
        css: ':root{--red: #f00; }',
      });
      assert.strictEqual(out, '');
    });
  });
});
