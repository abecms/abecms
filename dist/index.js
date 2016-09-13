#!/usr/bin/env node
'use strict';

var _es6Promise = require('es6-promise');

var _Create = require('./cli/Create');

var _Create2 = _interopRequireDefault(_Create);

var _Builder = require('./cli/Builder');

var _Builder2 = _interopRequireDefault(_Builder);

var _cli = require('./cli');

var _child_process = require('child_process');

var _gitExec = require('git-exec');

var _gitExec2 = _interopRequireDefault(_gitExec);

var _childProcessPromise = require('child-process-promise');

var _childProcessPromise2 = _interopRequireDefault(_childProcessPromise);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _pm = require('pm2');

var _pm2 = _interopRequireDefault(_pm);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).option('-p, --port <port>', 'Port on which to listen to (defaults to 8000)', parseInt).option('-i, --interactive', 'open in browser').option('-N, --pname <pname>', 'pm2 server name').option('-w, --webport <webport>', 'website port').option('-f, --folder <folder>', '--folder draft|sites').option('-t, --type <type>', '--type draft|other').option('-d, --destination <destination>', '--destination folder').parse(process.argv);

var userArgs = process.argv.slice(2);
var create = new _Create2.default();
var port = _commander2.default.port;
var interactive = _commander2.default.interactive;
var pm2Name = _commander2.default.pname;
var webport = _commander2.default.webport || 8081;

function addPlugin(dir, plugin) {
	var p = new _es6Promise.Promise(function (resolve, reject) {

		var pluginName = plugin.split('/');
		pluginName = pluginName[pluginName.length - 1].split('.')[0];
		var pluginDir = dir + '/plugins/' + pluginName;
		var command = 'git clone ' + plugin + ' ' + pluginDir;

		try {
			var stat = _fsExtra2.default.statSync(pluginDir);
			console.log(_cliColor2.default.green('remove plugin'), pluginName);
			_fsExtra2.default.removeSync(pluginDir);
		} catch (e) {}
		console.log(_cliColor2.default.green('mkdir'), _cliColor2.default.green(pluginDir));
		(0, _mkdirp2.default)(pluginDir);

		_gitExec2.default.clone(plugin, pluginDir, function (repo) {
			if (repo !== null) {
				try {
					console.log(_cliColor2.default.green('cd'), _cliColor2.default.green(pluginDir));
					process.chdir(pluginDir);

					console.log(_cliColor2.default.green('spawn'), _cliColor2.default.cyan('npm install'));
					// const npmInstall = spawn('npm', ['install', pluginDir]);
					var npmInstall = (0, _child_process.spawn)('npm', ['install']);

					npmInstall.stdout.on('data', function (data) {
						var str = data.toString(),
						    lines = str.split(/(\r?\n)/g);
						for (var i = 0; i < lines.length; i++) {
							console.log(str);
						}
					});

					npmInstall.stderr.on('data', function (data) {
						var str = data.toString(),
						    lines = str.split(/(\r?\n)/g);
						for (var i = 0; i < lines.length; i++) {
							console.log(str);
						}
					});

					npmInstall.on('close', function (code) {
						console.log(_cliColor2.default.cyan('child process exited with code'), code);

						var json = {};
						var abeJson = dir + '/abe.json';

						try {
							var stat = _fsExtra2.default.statSync(abeJson);
							if (stat) {
								json = _fsExtra2.default.readJsonSync(abeJson);
							}
						} catch (e) {
							console.log(e);
							console.log(_cliColor2.default.cyan('no abe.json creating'), abeJson);
						}

						if (typeof json.dependencies === 'undefined' || json.dependencies === null) {
							json.dependencies = [plugin];
						} else {
							var found = false;
							Array.prototype.forEach.call(json.dependencies, function (plugged) {
								if (plugin === plugged) {
									found = true;
								}
							});
							if (!found) {
								json.dependencies.push(plugin);
							}
						}

						_fsExtra2.default.writeJsonSync(abeJson, json, { space: 2, encoding: 'utf-8' });
						resolve();
					});
				} catch (err) {
					console.log(_cliColor2.default.cyan('chdir'), err);
				}
			} else {
				console.log(_cliColor2.default.red('clone error'));
			}
		});
	});

	return p;
}

if (typeof userArgs[0] !== 'undefined' && userArgs[0] !== null) {

	switch (userArgs[0]) {
		case 'build':
			var dir = process.cwd();
			process.chdir(__dirname + '/../');
			var command = 'ROOT=' + dir + ' FOLDER=' + (_commander2.default.folder ? _commander2.default.folder : 'draft') + ' DEST=' + (_commander2.default.destination ? _commander2.default.destination : 'tmp') + ' FLOW=' + (_commander2.default.type ? _commander2.default.type : 'draft') + ' npm run build:folder';
			console.log("command : " + command);
			_childProcessPromise2.default.exec(command).then(function (result) {
				var stdout = result.stdout;
				var stderr = result.stderr;
				if (stdout) console.log('stdout: ', stdout);
				if (stderr) console.log('stderr: ', stderr);
			}).fail(function (err) {
				console.error('ERROR: ', err);
			}).progress(function (childProcess) {
				// console.log('childProcess.pid: ', childProcess.pid);
			});
			break;
		case 'create':
			var dir = userArgs[1];
			if (process.env.ROOT) {
				dir = process.env.ROOT + userArgs[1];
			}
			if (typeof dir !== 'undefined' && dir !== null) {
				create.init(dir);
			} else {
				console.error("Error: no project path specified");
			}
			break;
		case 'serve':
			var dir = process.cwd();
			if (process.env.ROOT) {
				dir = process.env.ROOT;
			}
			var environment = process.env;
			environment.ROOT = dir;
			environment.WEBPORT = webport;
			if (typeof port !== 'undefined' && port !== null) {
				environment.PORT = port;
			}
			var command = 'node --harmony ./dist/server/index.js';
			// if (interactive) command = 'OPENURL=1 ' + command
			process.chdir(__dirname + '/../');
			console.log('website started : ' + dir + (port ? ' on port :' + port : ''));
			var cp = (0, _child_process.exec)(command, {
				env: environment
			}, function (err, out, code) {
				if (err instanceof Error) throw err;
				process.stderr.write(err);
				process.stdout.write(out);
				process.exit(code);
			});
			cp.stderr.pipe(process.stderr);
			cp.stdout.pipe(process.stdout);
			break;
		case 'list':
			var dir = process.cwd();
			dir = dir.replace(/\/$/, '');
			_pm2.default.connect(function (err) {
				if (err instanceof Error) throw err;

				_pm2.default.list(function (err, list) {
					if (err instanceof Error) throw err;
					Array.prototype.forEach.call(list, function (item) {
						console.log('[ pm2 ]', '{', '"pid":', item.pid + ',', '"process":', '"' + item.name + '"', '}');
					});
					process.exit(0);
				});
			});
			break;
		case 'prod':
			var dir = process.cwd();
			if (process.env.ROOT) {
				dir = process.env.ROOT;
			}
			dir = dir.replace(/\/$/, '');
			var abeJson = require(dir + '/abe.json');
			var processName = abeJson.processName || 'abe';
			var processPort = abeJson.port || port;
			_pm2.default.connect(function (err) {
				if (err instanceof Error) throw err;
				var start = _pm2.default.start;

				_pm2.default.list(function (err, process_list) {
					var found = false;

					Array.prototype.forEach.call(process_list, function (process) {
						if (process.name === processName) {
							found = true;
						}
					});

					var cb = function cb() {
						var options = {
							'name': processName,
							'nodeArgs': ['--harmony'],
							env: {
								'WEBPORT:': webport,
								'PORT': processPort,
								'ROOT': dir
							}
						};
						console.log('[ pm2 ] start', __dirname + '/server/index.js');
						_pm2.default.start(__dirname + '/server/index.js', options, function (err, proc) {
							if (err instanceof Error) throw err;

							_pm2.default.list(function (err, list) {
								if (err instanceof Error) throw err;
								Array.prototype.forEach.call(list, function (item) {
									console.log('[ pm2 ]', '{', '"pid":', item.pid + ',', '"process":', '"' + item.name + '"', '}');
								});
								process.exit(0);
							});
						});
					};

					if (!found) {
						cb();
					} else {
						console.log('[ pm2 ] stop ', processName);
						_pm2.default.delete(processName, function (err, proc) {
							if (err) throw new Error(err);
							console.log('[ pm2 ]', processName, 'server stopped');
							cb();
						});
					}
				});
			});
			break;
		case 'servenodemon':
			var dir = process.cwd();
			var command = 'WEBPORT=' + webport + ' ROOT=' + dir + ' npm run startdev --node-args="--debug"';
			if (interactive) command = 'OPENURL=1 ' + command;
			if (port) command = 'PORT=' + port + ' ' + command;
			process.chdir(__dirname + '/../');
			console.log('website started : ' + dir + (port ? ' on port :' + port : ''));
			var cp = (0, _child_process.exec)(command, function (err, out, code) {
				if (err instanceof Error) throw err;
				// process.stderr.write(err)
				// process.stdout.write(out)
				process.exit(code);
			});
			cp.stderr.pipe(process.stderr);
			cp.stdout.pipe(process.stdout);
			break;
		case 'stop':
			var dir = process.cwd();
			var abeJson = require(dir + '/abe.json');
			var processName = abeJson.processName || 'abe';
			var processPort = abeJson.port || port;
			_pm2.default.connect(function (err) {
				if (err instanceof Error) throw err;
				var start = _pm2.default.start;

				_pm2.default.list(function (err, process_list) {
					var found = false;

					Array.prototype.forEach.call(process_list, function (process) {
						if (process.name === processName) {
							found = true;
						}
					});

					if (found) {
						console.log('[ pm2 ] stop ', processName);
						_pm2.default.delete(processName, function (err, proc) {
							if (err) throw new Error(err);
							console.log('[ pm2 ]', processName, 'server stopped');
							process.exit(0);
						});
					}
				});
			});
			break;
		case 'publish-all':
			var dir = process.cwd();
			var customPath = '';
			if (typeof userArgs[1] !== 'undefined' && userArgs[1] !== null) {
				customPath = 'ABE_PATH=' + userArgs[1];
			}
			if (process.env.ROOT) {
				dir = process.env.ROOT.replace(/\/$/, '');
			}

			// var command = `node --harmony --debug ./cli/process/publish-all.js ABE_WEBSITE=${dir}`
			var publishAll = (0, _child_process.spawn)('node', ['--harmony', '--debug', __dirname + '/cli/process/publish-all.js', 'ABE_WEBSITE=' + dir, customPath]);

			publishAll.stdout.on('data', function (data) {
				console.log(_cliColor2.default.cyan('stdout'), data.toString());
			});

			publishAll.stderr.on('data', function (data) {
				console.log(_cliColor2.default.red('stderr'), data.toString());
			});

			publishAll.on('close', function (code) {
				console.log(_cliColor2.default.cyan('child process exited with code'), code);
				process.exit(0);
			});

			break;
		case 'update-json':
			var dir = process.cwd();
			if (process.env.ROOT) {
				dir = process.env.ROOT.replace(/\/$/, '');
			}

			var updateJson = (0, _child_process.spawn)('node', ['--harmony', '--debug', __dirname + '/cli/process/update-json.js', 'ABE_WEBSITE=' + dir]);

			updateJson.stdout.on('data', function (data) {
				console.log(_cliColor2.default.cyan('stdout'), data.toString());
			});

			updateJson.stderr.on('data', function (data) {
				console.log(_cliColor2.default.red('stderr'), data.toString());
			});

			updateJson.on('close', function (code) {
				console.log(_cliColor2.default.cyan('child process exited with code'), code);
				process.exit(0);
			});

			break;
		case 'install':
			var dir = process.cwd();
			var plugin = userArgs[1];
			if (process.env.ROOT) {
				dir = process.env.ROOT.replace(/\/$/, '');
			}

			var json = {};
			var abeJson = dir + '/abe.json';

			try {
				var stat = _fsExtra2.default.statSync(abeJson);
				if (stat) {
					json = _fsExtra2.default.readJsonSync(abeJson);
				}
			} catch (e) {
				console.log(_cliColor2.default.cyan('no config'), abeJson);
			}

			var ps = [];
			if (typeof json.dependencies !== 'undefined' || json.dependencies !== null) {
				Array.prototype.forEach.call(json.dependencies, function (plugged) {
					ps.push(addPlugin(dir, plugged));
				});
			}

			_es6Promise.Promise.all(ps).then(function () {
				process.exit(0);
			});
			break;
		case 'add':
			// ROOT=[ PATH TO PROJECT ]/abe-test-os ./node_modules/.bin/babel-node src/index.js add [ GIT PROJECT ]
			var dir = process.cwd();
			var plugin = userArgs[1];
			if (process.env.ROOT) {
				dir = process.env.ROOT.replace(/\/$/, '');
			}

			if (typeof dir !== 'undefined' && dir !== null) {
				if (typeof plugin !== 'undefined' && plugin !== null) {
					addPlugin(dir, plugin).then(function () {
						process.exit(0);
					});
				} else {
					console.log(_cliColor2.default.red("Error: no project path specified"));
				}
			} else {
				console.log(_cliColor2.default.red("Error: no project path specified"));
			}
			break;
		default:
			console.log("Help: use `create` or `serve` command");
			break;
	}
} else {
	console.log("Help: use `create` or `serve` command");
}