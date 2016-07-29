# node-typescript-compiler
[![NPM version](https://badge.fury.io/js/node-typescript-compiler.png)](http://badge.fury.io/js/node-typescript-compiler)
[![license](http://img.shields.io/badge/license-public_domain-brightgreen.png)](http://unlicense.org/)

Exposes typescript compiler (tsc) as a node.js module

Allows you to invoke `tsc` from a node program.

This work trivially by spawning `tsc` from the sibling `node_modules/typescript` module.


## installation
**node-typescript-compiler** requires the **typescript module** as a sibling (not included so you can choose version)

```bash
npm i --save-dev typescript
npm i --save-dev node-typescript-compiler
```

## Usage

The module exposes a unique function, `compile({options}, [files])`,
`files` being an optional array,
and `options` a hashmap of [tsc options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

Example invocations:

* Compile current project:

```js
const tsc = require('node-typescript-compiler')
tsc.compile({
	'project': '.'
})
.then(...)
```
--> `tsc --project .`

* Compile current project with some options overridden:

```js
const tsc = require('node-typescript-compiler')
const tsconfig = { json: require('../tsconfig.json') }

tsc.compile(
	Object.assign({}, tsconfig.json.compilerOptions, {
		'declaration': false,
		'outDir': 'dist/es6.amd',
		'module': 'amd'
	}),
	tsconfig.json.files,
)
```

* Get help:

```js
const tsc = require('node-typescript-compiler')

return tsc.compile({
	'help': true
})
```
--> `tsc --help` (boolean "true" values are not needed thus don't appear)

## design considerations
It seems we could do that more elegantly and at a deeper level by directly calling tsc code, as explained here: https://basarat.gitbooks.io/typescript/content/docs/compiler/overview.html

However, that would take a lot of time and effort, and I'm afraid of API changes. So *no*.
