'use strict';

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ./node_modules/.bin/babel-node src/cli/process/publish-all.js ABE_WEBSITE=/path/to/website
// ./node_modules/.bin/babel-node src/cli/process/publish-all.js FILEPATH=/path/to/website/path/to/file.html ABE_WEBSITE=/path/to/website
var pConfig = {};
Array.prototype.forEach.call(process.argv, function (item) {
  if (item.indexOf('=') > -1) {
    var ar = item.split('=');
    pConfig[ar[0]] = ar[1];
  }
});

if (typeof pConfig.ABE_PATH === 'undefined' || pConfig.ABE_PATH === null) {
  pConfig.ABE_PATH = '';
}

console.log(_cliColor2.default.green('start publish all') + ' path ' + pConfig.ABE_PATH);

function msToTime(duration) {
  var milliseconds = parseInt(duration % 1000 / 100),
      seconds = parseInt(duration / 1000 % 60),
      minutes = parseInt(duration / (1000 * 60) % 60),
      hours = parseInt(duration / (1000 * 60 * 60) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}

function publishNext(published, tt, cb) {
  var i = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var currentDateStart = new Date();
  var pub = published.shift();
  if (typeof pub !== 'undefined' && pub !== null) {

    var json = FileParser.getJson(pub.path);
    if (typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
      i++;

      var p = new Promise(function (resolve, reject) {
        try {

          save(pub.path, json.abe_meta.template, null, '', 'publish', null, 'publish', true).then(function () {
            var d = new Date(new Date().getTime() - currentDateStart.getTime());
            var total = new Date(new Date().getTime() - dateStart.getTime());
            // logsPub += i + ' [' + d + 'sec] > start publishing ' + pub.path .replace(config.root, '') + ' < ' + pub.path
            console.log(_cliColor2.default.green(i) + '/' + tt + ' - (' + _cliColor2.default.green(msToTime(d)) + '/' + msToTime(total) + ')');
            console.log(_cliColor2.default.bgWhite(_cliColor2.default.black(pub.path.replace(config.root, '').replace(config.data.url, ''))) + ' (' + _cliColor2.default.cyan(json.abe_meta.template) + ')');
            resolve();
          }).catch(function (e) {
            var d = new Date(new Date().getTime() - currentDateStart.getTime());
            var total = new Date(new Date().getTime() - dateStart.getTime());
            console.log(_cliColor2.default.red(i) + '/' + tt + ' - (' + _cliColor2.default.red(msToTime(d)) + '/' + msToTime(total) + ')');
            publishErrors.push({
              msg: e + '',
              json: json
            });
            // log.write('publish-all', e)
            console.log(_cliColor2.default.red(e));
            // log.write('publish-all', 'ERROR on ' + pub.path .replace(config.root, ''))
            console.log('publish-all', 'ERROR on ' + pub.path.replace(config.root, '').replace(config.data.url, ''));
            resolve();
          });
        } catch (e) {
          console.log(_cliColor2.default.red('cannot save') + ' ' + pub.path);
          resolve();
        }
      });
    }

    p.then(function () {
      publishNext(published, tt, cb, i++);
    }).catch(function () {
      publishNext(published, tt, cb, i++);
      console.log('error', _cliColor2.default.red(e));
    });
  } else {
    cb(i);
  }
}

var publishErrors = [];
var dateStart = new Date();
// var logsPub = ""
if (typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  var config = require('../../cli').config;
  if (pConfig.ABE_WEBSITE) config.set({ root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/' });
  try {

    // require controller to instanciate hooks
    var controllers = require('../../server/controllers');
    var FileParser = require('../../cli').FileParser;
    var fileUtils = require('../../cli').fileUtils;
    var folderUtils = require('../../cli').folderUtils;
    var save = require('../../cli').save;
    var Manager = require('../../cli').Manager;

    Manager.instance.init().then(function () {
      var i = 0;

      var files = Manager.instance.getList();

      // var result = []
      var published = [];
      var folderToParse = _path2.default.join(config.root, config.data.url, pConfig.ABE_PATH);
      Array.prototype.forEach.call(files, function (file) {
        if (typeof file.publish !== 'undefined' && file.publish !== null && file.path.indexOf(folderToParse) > -1) {
          published.push(file);
        }
      });

      console.log('Found ' + _cliColor2.default.green(published.length) + ' to republish');

      dateStart = new Date();
      publishNext(published, published.length, function (i) {
        console.log('total ' + _cliColor2.default.green(i) + ' files');
        if (publishErrors.length > 0) {
          var errorPath = _path2.default.join(config.root, 'abe-publish-all.' + dateStart.getTime() + '.log');
          console.log('Errors ' + _cliColor2.default.red(publishErrors.length) + ' see ' + errorPath + ' for more info');
          _fsExtra2.default.writeJsonSync(errorPath, publishErrors, {
            space: 2,
            encoding: 'utf-8'
          });
        }
        dateStart = Math.round((new Date().getTime() - dateStart.getTime()) / 1000 / 60 * 100) / 100;
        console.log('publish process finished in ' + _cliColor2.default.green(dateStart) + 'm');
        process.exit(0);
      });
    }).catch(function (e) {
      // log.write('publish-all', e)
      console.log('publish-all', e);
    });
  } catch (e) {
    // log.write('publish-all', e)
    console.log('publish-all', e);
  }
} else {
  console.log('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website');
  process.exit(0);
}