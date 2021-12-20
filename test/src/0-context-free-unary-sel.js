import dropcss  from'../../src/dropcss.js';
import assert from 'assert';

describe('Context-free, unary selector', () => {
	let html, css;

	describe('*', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div></div>',
				css:	'* {a:b;}',
			});
			assert.strictEqual(out, '*{a:b;}');
		});
	});

	describe('<tag>', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div></div>',
				css:	'div {a:b;}',
			});
			assert.strictEqual(out, 'div{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div></div>',
				css:	'span {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('#id', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div id="a"></div>',
				css:	'#a {a:b;}',
			});
			assert.strictEqual(out, '#a{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div id="a"></div>',
				css:	'#b {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('.class', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="a"></div>',
				css:	'.a {a:b;}',
			});
			assert.strictEqual(out, '.a{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div class="a"></div>',
				css:	'.b {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('[attr]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo></div>',
				css:	'[foo] {a:b;}',
			});
			assert.strictEqual(out, '[foo]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo></div>',
				css:	'[bar] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	// todo: test [foo="val"], [foo='val']
	describe('[attr=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo=bar] {a:b;}',
			});
			assert.strictEqual(out, '[foo=bar]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo=cow] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('[attr*=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo*=a] {a:b;}',
			});
			assert.strictEqual(out, '[foo*=a]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo*=c] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('[attr^=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo^=b] {a:b;}',
			});
			assert.strictEqual(out, '[foo^=b]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo^=c] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('[attr$=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo$=r] {a:b;}',
			});
			assert.strictEqual(out, '[foo$=r]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo$=z] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe('[attr~=value]', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	'[foo~=bar] {a:b;}',
			});
			assert.strictEqual(out, '[foo~=bar]{a:b;}');
		});

		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar baz"></div>',
				css:	'[foo~=bar] {a:b;}',
			});
			assert.strictEqual(out, '[foo~=bar]{a:b;}');
		});

		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="baz bar"></div>',
				css:	'[foo~=bar] {a:b;}',
			});
			assert.strictEqual(out, '[foo~=bar]{a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar-baz"></div>',
				css:	'[foo~=bar] {a:b;}',
			});
			assert.strictEqual(out, '');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="baz-bar"></div>',
				css:	'[foo~=bar] {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe(':not(<tag>)', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div></div>',
				css:	':not(span) {a:b;}',
			});
			assert.strictEqual(out, ':not(span){a:b;}')
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div></div>',
				css:	':not(div) {a:b;}',
			});
			assert.strictEqual(out, '');;
		});
	});

	describe(':not(#id)', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div id="a"></div>',
				css:	':not(#b) {a:b;}',
			});
			assert.strictEqual(out, ':not(#b){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div id="a"></div>',
				css:	':not(#a) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe(':not(.class)', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div class="a"></div>',
				css:	':not(.b) {a:b;}',
			});
			assert.strictEqual(out, ':not(.b){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div class="a"></div>',
				css:	':not(.a) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe(':not([attr])', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo></div>',
				css:	':not([bar]) {a:b;}',
			});
			assert.strictEqual(out, ':not([bar]){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo></div>',
				css:	':not([foo]) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	// todo: test [foo="val"], [foo='val']
	describe(':not([attr=value])', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo=cow]) {a:b;}',
			});
			assert.strictEqual(out, ':not([foo=cow]){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo=bar]) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe(':not([attr*=value])', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo*=c]) {a:b;}',
			});
			assert.strictEqual(out, ':not([foo*=c]){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo*=a]) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe(':not([attr^=value])', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo^=c]) {a:b;}',
			});
			assert.strictEqual(out, ':not([foo^=c]){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo^=b]) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	describe(':not([attr$=value])', () => {
		it('should retain present', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo$=z]) {a:b;}',
			});
			assert.strictEqual(out, ':not([foo$=z]){a:b;}');
		});

		it('should drop absent', function() {
			let {css: out} = dropcss({
				html:	'<div foo="bar"></div>',
				css:	':not([foo$=r]) {a:b;}',
			});
			assert.strictEqual(out, '');
		});
	});

	// *-child assertions dont make to test in a unary selector since all root elements will be first/last/only "children"
});
