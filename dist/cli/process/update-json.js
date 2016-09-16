'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cli = require('../../cli');

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

if (typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  if (pConfig.ABE_WEBSITE) _cli.config.set({ root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/' });

  var allJson;

  pConfig.FILEPATH = _path2.default.join(_cli.config.root, _cli.config.data.url, pConfig.FILEPATH ? pConfig.FILEPATH.replace(_cli.config.root) : '');

  if (pConfig.FILETYPE) {
    allJson = _cli.FileParser.getFilesByType(pConfig.FILEPATH, pConfig.FILETYPE);
  } else {
    allJson = _cli.FileParser.getFiles(pConfig.FILEPATH, true, 20, /\.json/);
  }

  var allJson = _cli.Hooks.instance.trigger('beforeUpdateJson', allJson);
} else {
  console.log('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website');
  process.exit(0);
}