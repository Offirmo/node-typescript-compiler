#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec /usr/bin/env node "$0" "$@"

const tsc = require('..')

tsc.compile({
	'help': 'true'
})
