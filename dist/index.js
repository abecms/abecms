#!/usr/bin/env node
'use strict';

var _Create = require('./cli/Create');

var _Create2 = _interopRequireDefault(_Create);

var _Builder = require('./cli/Builder');

var _Builder2 = _interopRequireDefault(_Builder);

var _cli = require('./cli');

var _child_process = require('child_process');

var _childProcessPromise = require('child-process-promise');

var _childProcessPromise2 = _interopRequireDefault(_childProcessPromise);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _pm = require('pm2');

var _pm2 = _interopRequireDefault(_pm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).option('-p, --port <port>', 'Port on which to listen to (defaults to 8000)', parseInt).option('-i, --interactive', 'open in browser').option('-N, --pname <pname>', 'pm2 server name').option('-w, --webport <webport>', 'website port').option('-f, --folder <folder>', '--folder draft|sites').option('-t, --type <type>', '--type draft|other').option('-d, --destination <destination>', '--destination folder').parse(process.argv);

var userArgs = process.argv.slice(2);
var create = new _Create2.default();
var port = _commander2.default.port;
var interactive = _commander2.default.interactive;
var pm2Name = _commander2.default.pname;
var webport = _commander2.default.webport || 8081;

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
			if (userArgs[1]) create.init(userArgs[1]);else console.error("Error: no project path specified");
			break;
		case 'serve':
			var dir = process.cwd();
			var command = 'WEBPORT=' + webport + ' ROOT=' + dir + ' node --harmony --debug ./dist/server/index.js';
			if (interactive) command = 'OPENURL=1 ' + command;
			if (port) command = 'PORT=' + port + ' ' + command;
			process.chdir(__dirname + '/../');
			console.log('website started : ' + dir + (port ? ' on port :' + port : ''));
			var cp = (0, _child_process.exec)(command, function (err, out, code) {
				if (err instanceof Error) throw err;
				process.stderr.write(err);
				process.stdout.write(out);
				process.exit(code);
			});
			cp.stderr.pipe(process.stderr);
			cp.stdout.pipe(process.stdout);
			break;
		case 'prod':
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

					var cb = function cb() {
						console.log('pm2 start', processName);
						var command = 'WEBPORT=' + webport + ' ROOT=' + dir + " " + __dirname + "/../node_modules/.bin/pm2 start ./dist/server/index.js --name='" + processName + "' --node-args='--harmony'";
						if (processPort) command = 'PORT=' + processPort + ' ' + command;
						process.chdir(__dirname + '/../');
						console.log('pm2 command : ' + command);
						var cp = (0, _child_process.exec)(command, function (err, out, code) {
							if (err instanceof Error) throw err;
							process.exit(code);
						});
						cp.stderr.pipe(process.stderr);
						cp.stdout.pipe(process.stdout);
					};

					if (!found) {
						cb();
					} else {
						console.log('pm2 stop', processName);
						_pm2.default.delete(processName, function (err, proc) {
							if (err) throw new Error(err);
							console.log('pm2', processName, 'server stopped');
							cb();
						});
					}
				});
			});
			break;
		case 'servepm2':
			var dir = process.cwd();
			var command = 'WEBPORT=' + webport + ' ROOT=' + dir + " pm2 start ./dist/server/index.js --node-args='--harmony'";
			if (interactive) command = 'OPENURL=1 ' + command;
			if (port) command = 'PORT=' + port + ' ' + command;
			if (pm2Name) command = command + (' --name="' + pm2Name + '"');
			process.chdir(__dirname + '/../');
			console.log('pm2 command : ' + command);
			var cp = (0, _child_process.exec)(command, function (err, out, code) {
				if (err instanceof Error) throw err;
				// process.stderr.write(err)
				// process.stdout.write(out)
				process.exit(code);
			});
			cp.stderr.pipe(process.stderr);
			cp.stdout.pipe(process.stdout);
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
			var cp = (0, _child_process.exec)('pm2 delete all', function (err, out, code) {
				if (err instanceof Error) throw err;
				// process.stderr.write(err)
				// process.stdout.write(out)
				process.exit(code);
			});
			cp.stderr.pipe(process.stderr);
			cp.stdout.pipe(process.stdout);
			break;
		default:
			console.log("Help: use `create` or `serve` command");
			break;
	}
} else {
	console.log("Help: use `create` or `serve` command");
}