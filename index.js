// this file should work with current node stable (v4 on 2016/07/12)
"use strict";

///////////////////////////////////////////////////////

const path = require('path')
const spawn = require('child_process').spawn
const path_exists = require('path-exists')
const tildify = require('tildify')
const os_homedir = require('os-homedir')
const _ = require('lodash')


///////////////////////////////////////////////////////

const spawn_options = {
	env: process.env
}
const MODULE_ID = 'node-typescript-compiler'

///////////////////////////////////////////////////////

module.exports = {
	compile
}

///////////////////////////////////////////////////////
const RADIX = 'tsc'

function compile(params, files) {
	params = params || {}
	files = files || []

	return new Promise((resolve, reject) => {

		const options_as_array = _.flatten(_.map(params, (value, key) => {
			if (value === false)
				return []
			if (value === true)
				return [ `--${key}` ]
			return [ `--${key}`, value ]
		}))
		const spawn_params = options_as_array.concat(files)

		var stdout = ''
		var stderr = ''

		find_tsc()
		.then(spawn_executable => {
			console.log(`[${MODULE_ID}] spawning ${tildify(spawn_executable)} ` + spawn_params.join(' ') + '\n')
			const spawn_instance = spawn(spawn_executable, spawn_params, spawn_options)

			function fail(reason) {
				const err = new Error(reason)
				err.stdout = stdout
				err.stderr = stderr
				console.error(err)
				reject(err)
			}

			// listen to events
			spawn_instance.on('error', err => {
				fail(`Spawn : got err event : ${err}`)
			})
			spawn_instance.on('disconnect', () => {
				console.log(`Spawn : got disconnect`)
			})
			spawn_instance.on('exit', (code, signal) => {
				if (code === 0)
					resolve(stdout)
				else
					fail(`Spawn : got event exit with error code "${code}" & signal "${signal}"`)
			})
			spawn_instance.on('close', (code, signal) => {
				if (code === 0)
					resolve(stdout)
				else
					fail(`Spawn : got event close with error code "${code}" & signal "${signal}"`)
			})

			// for debug purpose only
			spawn_instance.stdin.on('data', data => {
				console.log(`[${MODULE_ID}] got stdin data event : "${data}"`)
			})
			// mandatory for correct error detection
			spawn_instance.stdin.on('error', error => {
				fail(`[${MODULE_ID}] got stdin error event : "${error}"`)
			})

			spawn_instance.stdout.on('data', data => {
				_.split(data, '\n').forEach(line => {
					if (line[0] === '/')
						line = tildify(line) // convenience for readability if using --listFiles
					console.log(RADIX + ' > ' + line)
				})
				stdout += data
			})
			// mandatory for correct error detection
			spawn_instance.stdout.on('error', error => {
				fail(`[${MODULE_ID}] got stdout error event : "${error}"`)
			})

			spawn_instance.stderr.on('data', data => {
				_.split(data, '\n').forEach(line => console.log(RADIX + ' ! ' + line))
				stderr += data
			})
			// mandatory for correct error detection
			spawn_instance.stderr.on('error', error => {
				fail(`[${MODULE_ID}] got stderr error event : "${error}"`)
			})
		})
		.catch(reject)
	})
}


/////////////

function find_tsc() {
	let result

	// obvious candidate from sibling module,
	// but won't work if symlinked, with npm link for ex. or with npm-pkgr
	const candidate_from_sibling_module = path.join(__dirname, '../typescript/bin/tsc')

	// second try: should work even if module is symlinked
	const candidate_from_caller_node_module = path.join(process.cwd(), 'node_modules/typescript/bin/tsc')

	// third try: fallbacking to an eventual global typescript module
	const candidate_from_global = path.join(os_homedir(), '.nvm/versions/node/', process.version, 'bin/tsc')

	function candidate_if_exists(candidate) {
		return path_exists(candidate)
		.then(exists => {
			if (!exists) throw new Error(`[${MODULE_ID}] couldnt find "${candidate}"`)
			return candidate
		})
	}

	return candidate_if_exists(candidate_from_sibling_module)
	.catch(() => candidate_if_exists(candidate_from_caller_node_module))
	.catch(() => candidate_if_exists(candidate_from_global))
}
