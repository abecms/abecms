#!/usr/bin/env node

import Create from './cli/Create'
import Builder from './cli/Builder'
import {config} from './cli'
import {exec} from 'child_process'
import execPromise from 'child-process-promise'
import fse from 'fs-extra'
import program from 'commander'
import pkg from '../package'
import pm2 from 'pm2'

program
  .version(pkg.version)
  .option('-p, --port <port>', 'Port on which to listen to (defaults to 8000)', parseInt)
  .option('-i, --interactive', 'open in browser')
  .option('-N, --pname <pname>', 'pm2 server name')
  .option('-w, --webport <webport>', 'website port')
  .option('-f, --folder <folder>', '--folder draft|sites')
  .option('-t, --type <type>', '--type draft|other')
  .option('-d, --destination <destination>', '--destination folder')
  .parse(process.argv)

var userArgs = process.argv.slice(2)
var create = new Create()
var port = program.port
var interactive = program.interactive
var pm2Name = program.pname
var webport = program.webport || 8081

if(typeof userArgs[0] !== 'undefined' && userArgs[0] !== null){

	switch(userArgs[0]){
		case 'build':
			var dir = process.cwd();
			process.chdir(__dirname + '/../')
			var command = 'ROOT=' + dir +
				' FOLDER=' + (program.folder ? program.folder : 'draft') +
				' DEST=' + (program.destination ? program.destination : 'tmp') +
				' FLOW=' + (program.type ? program.type : 'draft') +
				' npm run build:folder'
			console.log("command : " + command)
			execPromise.exec(command)
				.then(function (result) {
	        var stdout = result.stdout;
	        var stderr = result.stderr;
	        if(stdout) console.log('stdout: ', stdout);
	        if(stderr) console.log('stderr: ', stderr);
		    })
		    .fail(function (err) {
	        console.error('ERROR: ', err);
		    })
		    .progress(function (childProcess) {
	        // console.log('childProcess.pid: ', childProcess.pid);
		    });
		break
		case 'create':
			var dir = userArgs[1]
			if(process.env.ROOT) {
				dir = process.env.ROOT + userArgs[1]
			}
			if(typeof dir !== 'undefined' && dir !== null) {
			 	create.init(dir)
			}else {
				console.error("Error: no project path specified")
			}
		break
		case 'serve':
			var dir = process.cwd();
			var command = 'WEBPORT=' + webport + ' ROOT=' + dir + ' node --harmony --debug ./dist/server/index.js';
			if (interactive) command = 'OPENURL=1 ' + command
			if(port) command = 'PORT=' + port + ' ' + command
			process.chdir(__dirname + '/../')
			console.log('website started : ' + dir + (port ? ' on port :' + port : ''))
			var cp = exec(command, function (err, out, code) {
				if (err instanceof Error) throw err
			  process.stderr.write(err)
			  process.stdout.write(out)
			  process.exit(code)
			})
			cp.stderr.pipe(process.stderr)
			cp.stdout.pipe(process.stdout)
		break
		case 'prod':
			var dir = process.cwd();
			var abeJson = require(dir + '/abe.json')
			var processName = abeJson.processName || 'abe'
			var processPort = abeJson.port || port
			pm2.connect((err) => {
				if (err instanceof Error) throw err
				var start = pm2.start

				pm2.list(function(err, process_list) {
					var found = false;

					Array.prototype.forEach.call(process_list, function(process) {
						if (process.name === processName) {
							found = true
						}
					})

					var cb = function() {
						var options = {
							'name':processName,
							'nodeArgs':['--harmony'],
							env: {
								'WEBPORT:': webport,
								'PORT': processPort,
								'ROOT': dir
							}
						}
						console.log('[ pm2 ] start', __dirname + '/server/index.js')
						pm2.start(
							__dirname + '/server/index.js',
							options,
							function(err, proc) {
								if (err instanceof Error) throw err

								pm2.list((err, list) => {
									 if (err instanceof Error) throw err
									Array.prototype.forEach.call(list, (item) => {
										console.log('[ pm2 ]', '{', '"pid":', item.pid + ',', '"process":', '"' + item.name + '"', '}')
									})
									process.exit(0);
								})
							})
					}

					if (!found) {
						cb()
					}else {
						console.log('[ pm2 ] stop ', processName)
						pm2.delete(processName, function(err, proc) {
					    if (err) throw new Error(err);
					    console.log('[ pm2 ]', processName,  'server stopped')
					    cb()
						});
					}
				});
			})
		break
		case 'servenodemon':
			var dir = process.cwd();
			var command = 'WEBPORT=' + webport + ' ROOT=' + dir + ' npm run startdev --node-args="--debug"'
			if (interactive) command = 'OPENURL=1 ' + command
			if(port) command = 'PORT=' + port + ' ' + command
			process.chdir(__dirname + '/../')
			console.log('website started : ' + dir + (port ? ' on port :' + port : ''))
			var cp = exec(command, function (err, out, code) {
				if (err instanceof Error) throw err
			  // process.stderr.write(err)
			  // process.stdout.write(out)
			  process.exit(code)
			})
			cp.stderr.pipe(process.stderr)
			cp.stdout.pipe(process.stdout)
		break
		case 'stop':
			var dir = process.cwd();
			var abeJson = require(dir + '/abe.json')
			var processName = abeJson.processName || 'abe'
			var processPort = abeJson.port || port
			pm2.connect((err) => {
				if (err instanceof Error) throw err
				var start = pm2.start

				pm2.list(function(err, process_list) {
					var found = false;

					Array.prototype.forEach.call(process_list, function(process) {
						if (process.name === processName) {
							found = true
						}
					})

					if (found) {
						console.log('[ pm2 ] stop ', processName)
						pm2.delete(processName, function(err, proc) {
					    if (err) throw new Error(err);
					    console.log('[ pm2 ]', processName,  'server stopped')
					    process.exit(0);
						});
					}
				});
			})
		break
		default:
			console.log("Help: use `create` or `serve` command")
		break
	}

}
else{
	console.log("Help: use `create` or `serve` command")
}