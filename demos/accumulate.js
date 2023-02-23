const dropcss = require('../src/dropcss');

// super mega-huge combined stylesheet
const css = `
	em {
		color: red;
	}

	p {
		font-weight: bold;
	}

	.foo {
		font-size: 10pt;
	}
`;

// html of page (or state) A
const htmlA = `
	<html>
		<head></head>
		<body>
			<em>Hello World!</em>
		</body>
	</html>
`;

// html of page (or state) B
const htmlB = `
	<html>
		<head></head>
		<body>
			<p>Soft Kitties!</p>
		</body>
	</html>
`;

// whitelist
const whitelist = new Set();

const resA = dropcss({
  css,
  html: htmlA,
});

// accumulate retained A selectors
resA.sels.forEach((sel) => whitelist.add(sel));

const resB = dropcss({
  css,
  html: htmlB,
});

// accumulate retained B selectors
resB.sels.forEach((sel) => whitelist.add(sel));

// final purge relying only on accumulated whitelist
const cleaned = dropcss({
  html: '',
  css,
  shouldDrop: (sel) => !whitelist.has(sel),
});

// eslint-disable-next-line no-console
console.log(cleaned.css);
