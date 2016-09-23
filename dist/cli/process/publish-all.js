'use strict';

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

pConfig.TYPE = pConfig.TYPE || 'publish';

if (typeof pConfig.ABE_PATH === 'undefined' || pConfig.ABE_PATH === null) {
  pConfig.ABE_PATH = '';
}

console.log(_cliColor2.default.green('start publish all') + ' path ' + pConfig.ABE_PATH);

function msToTime(duration) {
  var milliseconds = parseInt(duration % 1000 / 100),
      seconds = parseInt(duration / 1000 % 60),
      minutes = parseInt(duration / (1000 * 60) % 60),
      hours = parseInt(duration / (1000 * 60 * 60) % 24);

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function publishNext(published, tt, cb) {
  var i = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var currentDateStart = new Date();
  var pub = published.shift();
  if (typeof pub !== 'undefined' && pub !== null) {

    var jsonPath = FileParser.changePathEnv(pub.path, config.data.url).replace(new RegExp("\\." + config.files.templates.extension), '.json');
    var json = FileParser.getJson(jsonPath);
    if (typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
      i++;
      ar_url.push(pub.path);

      var p = new Promise(function (resolve, reject) {
        try {

          save(pub.path, json.abe_meta.template, null, '', pConfig.TYPE, null, pConfig.TYPE, true).then(function () {
            var d = new Date(new Date().getTime() - currentDateStart.getTime());
            var total = new Date(new Date().getTime() - dateStart.getTime());
            // logsPub += i + ' [' + d + 'sec] > start publishing ' + pub.path .replace(config.root, '') + ' < ' + jsonPath
            console.log(_cliColor2.default.green(i) + '/' + tt + ' - (' + _cliColor2.default.green(msToTime(d)) + '/' + msToTime(total) + ')');
            console.log(_cliColor2.default.bgWhite(_cliColor2.default.black(pub.path.replace(config.root, '').replace(config.publish.url, ''))) + ' < ' + _cliColor2.default.bgWhite(_cliColor2.default.black(jsonPath.replace(config.root, '').replace(config.data.url, ''))) + ' (' + _cliColor2.default.cyan(json.abe_meta.template) + ')');
            resolve();
          }).catch(function (e) {
            // log.write('publish-all', e)
            console.log('publish-all', e);
            // log.write('publish-all', 'ERROR on ' + pub.path .replace(config.root, ''))
            console.log('publish-all', 'ERROR on ' + pub.path.replace(config.root, ''));
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

var ar_url = [];
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
    var log = require('../../cli').log;
    var Manager = require('../../cli').Manager;

    Manager.instance.init().then(function () {
      var type = null;
      var folder = null;
      if (typeof pConfig.FILEPATH !== 'undefined' && pConfig.FILEPATH !== null) {
        console.log('publish-all', 'started by < ' + pConfig.FILEPATH.replace(config.root, ''));
        pConfig.FILEPATH = _path2.default.join(config.root, config.data.url, pConfig.FILEPATH.replace(config.root));

        var fileJson = FileParser.getJson(pConfig.FILEPATH.replace(new RegExp("\\." + config.files.templates.extension), '.json'));

        if (typeof fileJson !== 'undefined' && fileJson !== null) {
          if (typeof fileJson.abe_meta !== 'undefined' && fileJson.abe_meta !== null) {
            type = fileJson.abe_meta.template;
            folder = fileUtils.removeLast(fileJson.abe_meta.link);
          }
        }
      }

      var site = folderUtils.folderInfos(config.root);
      var publish = config.publish.url;
      var published = FileParser.getFilesByType(_path2.default.join(site.path, publish, pConfig.ABE_PATH));
      published = FileParser.getMetas(published, 'draft');
      var i = 0;

      console.log('Found ' + _cliColor2.default.green(published.length) + ' to republish');
      dateStart = new Date();
      publishNext(published, published.length, function (i) {
        console.log('total ' + _cliColor2.default.green(i) + ' files');
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