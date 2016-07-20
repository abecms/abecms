'use strict';

var nodemon = require('nodemon');
var watch = require('watch');
var fs = require('fs');
var clc = require('cli-color');

// NODE_ENV=development nodemon --exec npm run babel-app src/server/app.js --kill-others
// ROOT=/path/to/my/abesite node src/tasks/nodemon.js

nodemon({
  script: __dirname + '/../../src/server/app.js',
  options: {
    exec: __dirname + '/../../node_modules/.bin/babel-node --presets es2015'
  },
  nodeArgs: ['--debug'],
  restartable: 'rs',
  colours: true,
  execMap: {
    js: __dirname + '/../../node_modules/.bin/babel-node --presets es2015'
  },
  env: {
    'NODE_ENV': 'development'
  },
  ignore: ["docs/*"],
  watch: ['src/cli/*', 'src/hooks/*', 'src/server/routes/*', 'src/server/helpers/*', 'src/server/middlewares/*', 'src/server/controllers/*', 'src/server/app.js', 'src/server/index.js', process.env.ROOT + '/plugins/*', process.env.ROOT + '/abe.json', process.env.ROOT + '/locales/*', process.env.ROOT + '/test/*', process.env.ROOT + '/hooks/*'],
  stdin: true,
  runOnChangeOnly: false,
  verbose: true,
  // 'stdout' refers to the default behaviour of a required nodemon's child,
  // but also includes stderr. If this is false, data is still dispatched via
  // nodemon.on('stdout/stderr')
  stdout: true
});

nodemon.on('start', function () {}).on('quit', function () {
  console.log(clc.green('Kill process nodemon'));
  process.exit();
}).on('restart', function (files) {
  console.log('------------------------------------------------------------');
  console.log(clc.green('App restarted due to: '), files[0]);
});