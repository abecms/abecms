#!/usr/bin/env node
import {Promise} from 'es6-promise'
import Create from './cli/Create'
import Builder from './cli/Builder'
import {config} from './cli'
import {exec} from 'child_process'
import {spawn} from 'child_process'
import git from 'git-exec'
import execPromise from 'child-process-promise'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'
import program from 'commander'
import pkg from '../package'
import pm2 from 'pm2'
import clc from 'cli-color'

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

function addPlugin(dir, plugin) {
	var p = new Promise((resolve, reject) => {
			
 		var pluginName = plugin.split('/')
 		pluginName = pluginName[pluginName.length - 1].split('.')[0]
		var pluginDir = dir + '/plugins/' + pluginName
		var command = 'git clone ' + plugin + ' ' + pluginDir

		try{
	    var stat = fse.statSync(pluginDir)
	    console.log(clc.green(`remove plugin`), pluginName)
	    fse.removeSync(pluginDir)
	  }
	  catch(e){
	  }
		console.log(clc.green(`mkdir`), clc.green(pluginDir))
		mkdirp(pluginDir)

		git.clone(plugin, pluginDir, function(repo) {
			if (repo !== null) {
				try {
					console.log(clc.green(`cd`), clc.green(pluginDir))
				  process.chdir(pluginDir);

					console.log(clc.green(`spawn`), clc.cyan('npm install'))
					// const npmInstall = spawn('npm', ['install', pluginDir]);
					const npmInstall = spawn('npm', ['install']);

					npmInstall.stdout.on('data', (data) => {
					  var str = data.toString(), lines = str.split(/(\r?\n)/g);
					  for (var i=0; i<lines.length; i++) {
					    console.log(str)
					  }
					});

					npmInstall.stderr.on('data', (data) => {
					  var str = data.toString(), lines = str.split(/(\r?\n)/g);
					  for (var i=0; i<lines.length; i++) {
					    console.log(str)
					  }
					});

					npmInstall.on('close', (code) => {
						console.log(clc.cyan(`child process exited with code`), code);

						var json = {}
						var abeJson = dir + '/abe.json'
				    
						try {
							var stat = fse.statSync(abeJson)
							if (stat) {
								json = fse.readJsonSync(abeJson)
							}
						}catch(e) {
							console.log(e)
							console.log(clc.cyan(`no abe.json creating`), abeJson);
						}

						if(typeof json.dependencies === 'undefined' || json.dependencies === null) {
							json.dependencies = [plugin]
						}else {
							var found = false
							Array.prototype.forEach.call(json.dependencies, (plugged) => {
								if (plugin === plugged) {
									found = true
								}
							})
							if (!found) {
								json.dependencies.push(plugin)
							}
						}

				    fse.writeJsonSync(abeJson, json, { space: 2, encoding: 'utf-8' })
				    resolve()
					});
				} catch (err) {
					console.log(clc.cyan(`chdir`), err);
				}
		  } else {
		    console.log(clc.red(`clone error`));
		  }
		});
	})

	return p
}

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
			if(process.env.ROOT) {
				dir = process.env.ROOT
			}
			var environment = process.env;
			environment.ROOT = dir
			environment.WEBPORT = webport
			if (typeof port !== 'undefined' && port !== null) {
				environment.PORT = port;
			}
			var command = 'node --harmony --debug ./dist/server/index.js';
			// if (interactive) command = 'OPENURL=1 ' + command
			process.chdir(__dirname + '/../')
			console.log('website started : ' + dir + (port ? ' on port :' + port : ''))
			var cp = exec(command,
				{
					env: environment
				},
				function (err, out, code) {
				if (err instanceof Error) throw err
			  process.stderr.write(err)
			  process.stdout.write(out)
			  process.exit(code)
			})
			cp.stderr.pipe(process.stderr)
			cp.stdout.pipe(process.stdout)
		break
		case 'list':
			var dir = process.cwd();
			dir = dir.replace(/\/$/, '')
			pm2.connect((err) => {
				if (err instanceof Error) throw err

				pm2.list(function(err, list) {
					if (err instanceof Error) throw err
					Array.prototype.forEach.call(list, (item) => {
						console.log('[ pm2 ]', '{', '"pid":', item.pid + ',', '"process":', '"' + item.name + '"', '}')
					})
					process.exit(0);
				});
			})
		break
		case 'prod':
			var dir = process.cwd();
			if(process.env.ROOT) {
				dir = process.env.ROOT
			}
			dir = dir.replace(/\/$/, '')
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
		case 'install':
			var dir
			var plugin = userArgs[1]
			if(process.env.ROOT) {
				dir = process.env.ROOT.replace(/\/$/, '')
			}

			var json = {}
			var abeJson = dir + '/abe.json'
	    
			try {
				var stat = fse.statSync(abeJson)
				if (stat) {
					json = fse.readJsonSync(abeJson)
				}
			}catch(e) {
				console.log(clc.cyan(`no config`), abeJson);
			}

			var ps = []
			if(typeof json.dependencies !== 'undefined' || json.dependencies !== null) {
				Array.prototype.forEach.call(json.dependencies, (plugged) => {
					ps.push(addPlugin(dir, plugged))
				})
			}
			
			Promise.all(ps)
				.then(function() {
					process.exit(0) 
				})
		break
		case 'add':
			// ROOT=[ PATH TO PROJECT ]/abe-test-os ./node_modules/.bin/babel-node src/index.js add [ GIT PROJECT ]
			var dir
			var plugin = userArgs[1]
			if(process.env.ROOT) {
				dir = process.env.ROOT.replace(/\/$/, '')
			}

			if(typeof dir !== 'undefined' && dir !== null) {
			 	if(typeof plugin !== 'undefined' && plugin !== null) {
					addPlugin(dir, plugin)
						.then(function() {
					    process.exit(0) 
						})
			 	}else {
					console.log(clc.red("Error: no project path specified"))
			 	}
			}else {
				console.log(clc.red("Error: no project path specified"))
			}
		break
		default:
			console.log("Help: use `create` or `serve` command")
		break
	}

}
else{
	console.log("Help: use `create` or `serve` command")
}