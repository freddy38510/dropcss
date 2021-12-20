import dropcss  from'../../src/dropcss.js';
import assert from 'assert';

describe('Context-free, multi selector', () => {
	let html, css;

	describe('<tag>.class', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="foo"></div>',
				css:	'div.foo {a:b;}',
			});
			assert.strictEqual(out, 'div.foo{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<i class="foo"></i>',
				css:	'div.foo {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('<tag>#id', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div id="a"></div>',
				css:	'div#a {a:b;}',
			});
			assert.strictEqual(out, 'div#a{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<i id="a"></i>',
				css:	'div#a {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('.class.class', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="a b"></div>',
				css:	'.b.a {a:b;}',
			});
			assert.strictEqual(out, '.b.a{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div class="a z"></div>',
				css:	'.b.a {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('#id.class', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="a" id="foo"></div>',
				css:	'#foo.a {a:b;}',
			});
			assert.strictEqual(out, '#foo.a{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div class="a"></div>',
				css:	'#foo.a {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('<tag>[attr]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo></div>',
				css:	'div[foo] {a:b;}',
			});
			assert.strictEqual(out, 'div[foo]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo></div>',
				css:	'i[foo] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	// todo: test [foo="val"], [foo='val']
	describe('.class[attr=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="z" foo="bar"></div>',
				css:	'.z[foo=bar] {a:b;}',
			});
			assert.strictEqual(out, '.z[foo=bar]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'.z[foo=bar] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('[attr*=value][attr*=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar" moo="cow"></div>',
				css:	'[foo*=a][moo*=w] {a:b;}',
			});
			assert.strictEqual(out, '[foo*=a][moo*=w]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar" moo="cow"></div>',
				css:	'[foo*=a][baz*=w] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('.class[attr^=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="z" foo="bar"></div>',
				css:	'.z[foo^=b] {a:b;}',
			});
			assert.strictEqual(out, '.z[foo^=b]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div class="z" foo="bar"></div>',
				css:	'[foo^=c] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('<tag>[attr$=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'div[foo$=r] {a:b;}',
			});
			assert.strictEqual(out, 'div[foo$=r]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'div[foo$=z] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('<tag>:not(.class)', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="bar"></div>',
				css:	'div:not(.foo) {a:b;}',
			});
			assert.strictEqual(out, 'div:not(.foo){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div class="foo"></div><i></i>',
				css:	'div:not(.foo) {a:b;}',
			});
			assert.strictEqual(out, '');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<i></i>',
				css:	'div:not(.foo) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('<tag>:not(:nth-child(n+3))', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div><p></p><p></p><p></p><p></p></div>',
				css:	'p:not(:nth-child(n+3)) {a:b;}',
			});
			assert.strictEqual(out, 'p:not(:nth-child(n+3)){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div><i></i><i></i><p></p><p></p></div>',
				css:	'p:not(:nth-child(n+3)) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	// TODO: rest that match the non-:not() versions

	// *-child assertions dont make to test in a unary selector since all root elements will be first/last/only "children"
});
