'use strict';

var _cli = require('../../cli');

var pConfig = {}; // ./node_modules/.bin/babel-node src/cli/process/publish-all.js ABE_WEBSITE=/path/to/website
// ./node_modules/.bin/babel-node src/cli/process/publish-all.js FILEPATH=/path/to/website/path/to/file.html ABE_WEBSITE=/path/to/website

Array.prototype.forEach.call(process.argv, function (item) {
  if (item.indexOf('=') > -1) {
    var ar = item.split('=');
    pConfig[ar[0]] = ar[1];
  }
});

if (typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  if (pConfig.ABE_WEBSITE) _cli.config.set({ root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/' });

  var type = null;
  var folder = null;
  if (typeof pConfig.FILEPATH !== 'undefined' && pConfig.FILEPATH !== null) {
    pConfig.FILEPATH = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.data.url, pConfig.FILEPATH.replace(_cli.config.root));

    var fileJson = _cli.FileParser.getJson(pConfig.FILEPATH.replace(new RegExp("\\." + _cli.config.files.templates.extension), '.json'));

    type = fileJson.abe_meta.template;
    folder = _cli.fileUtils.removeLast(fileJson.abe_meta.link);
  }

  var site = _cli.folderUtils.folderInfos(_cli.config.root);
  var allPublished = [];

  var publish = _cli.config.publish.url;
  var published = _cli.FileParser.getFilesByType(_cli.fileUtils.concatPath(site.path, publish));
  published = _cli.FileParser.getMetas(published, 'draft');

  var ar_url = [];
  var promises = [];

  published.forEach(function (pub) {
    var json = _cli.FileParser.getJson(_cli.FileParser.changePathEnv(pub.path, _cli.config.data.url).replace(new RegExp("\\." + _cli.config.files.templates.extension), '.json'));
    ar_url.push(pub.path);

    // save(url, tplPath, json = null, text = '', type = '', previousSave = null, realType = 'draft', publishAll = false)

    var p = new Promise(function (resolve, reject) {
      (0, _cli.save)(pub.path, json.abe_meta.template, json, '', 'publish', null, 'publish', true).then(function () {
        resolve();
      }).catch(function (e) {
        next();
      });
    });
    promises.push(p);
  });

  Promise.all(promises).then(function () {
    process.exit(0);
  }).catch(function (e) {
    console.error(e.stack);
    next();
  });
} else {
  console.log('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website');
  process.exit(0);
}