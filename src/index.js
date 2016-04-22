#!/usr/bin/env node

import Create from './cli/Create'
import Builder from './cli/Builder'
import {exec} from 'child_process'
import execPromise from 'child-process-promise'
import fse from 'fs-extra'
import program from 'commander'
import pkg from '../package'

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
			if(userArgs[1]) create.init(userArgs[1])
			else console.error("Error: no project path specified")
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
		case 'servepm2':
			var dir = process.cwd();
			var command = 'WEBPORT=' + webport + ' ROOT=' + dir + " pm2 start ./dist/server/index.js --node-args='--harmony'";
			if (interactive) command = 'OPENURL=1 ' + command
			if(port) command = 'PORT=' + port + ' ' + command
			if(pm2Name) command = command + ` --name="${pm2Name}"`
			process.chdir(__dirname + '/../')
			console.log('pm2 command : ' + command)
			var cp = exec(command, function (err, out, code) {
				if (err instanceof Error) throw err
			  // process.stderr.write(err)
			  // process.stdout.write(out)
			  process.exit(code)
			})
			cp.stderr.pipe(process.stderr)
			cp.stdout.pipe(process.stdout)
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
			var cp = exec('pm2 delete all', function (err, out, code) {
				if (err instanceof Error) throw err
			  // process.stderr.write(err)
			  // process.stdout.write(out)
			  process.exit(code)
			})
			cp.stderr.pipe(process.stderr)
			cp.stdout.pipe(process.stdout)
		break
		default:
			console.log("Help: use `create` or `serve` command")
		break
	}

}
else{
	console.log("Help: use `create` or `serve` command")
}