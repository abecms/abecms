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

pConfig.TYPE = pConfig.TYPE || 'publish';

// var logsPub = ""
if (typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  if (pConfig.ABE_WEBSITE) _cli.config.set({ root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/' });
  try {

    // log.write('publish-all', '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
    console.log('publish-all', '* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *');
    // log.write('publish-all', 'start process publish')
    console.log('publish-all', 'start process publish');
    var dateStart = new Date();

    var type = null;
    var folder = null;
    if (typeof pConfig.FILEPATH !== 'undefined' && pConfig.FILEPATH !== null) {
      // log.write('publish-all', 'started by < ' + pConfig.FILEPATH.replace(config.root, ''))
      console.log('publish-all', 'started by < ' + pConfig.FILEPATH.replace(_cli.config.root, ''));
      pConfig.FILEPATH = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.data.url, pConfig.FILEPATH.replace(_cli.config.root));

      var fileJson = _cli.FileParser.getJson(pConfig.FILEPATH.replace(new RegExp("\\." + _cli.config.files.templates.extension), '.json'));

      if (typeof fileJson !== 'undefined' && fileJson !== null) {
        if (typeof fileJson.abe_meta !== 'undefined' && fileJson.abe_meta !== null) {
          type = fileJson.abe_meta.template;
          folder = _cli.fileUtils.removeLast(fileJson.abe_meta.link);
        }
      }
    }

    var site = _cli.folderUtils.folderInfos(_cli.config.root);
    var allPublished = [];

    var publish = _cli.config.publish.url;
    var published = _cli.FileParser.getFilesByType(_cli.fileUtils.concatPath(site.path, publish));
    published = _cli.FileParser.getMetas(published, 'draft');

    var ar_url = [];
    var promises = [];
    var i = 0;

    published.forEach(function (pub) {
      var jsonPath = _cli.FileParser.changePathEnv(pub.path, _cli.config.data.url).replace(new RegExp("\\." + _cli.config.files.templates.extension), '.json');
      var json = _cli.FileParser.getJson(jsonPath);
      if (typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
        i++;
        ar_url.push(pub.path);

        // save(url, tplPath, json = null, text = '', type = '', previousSave = null, realType = 'draft', publishAll = false)

        var p = new Promise(function (resolve, reject) {
          var d = (new Date().getTime() - dateStart.getTime()) / 1000;
          // logsPub += i + ' [' + d + 'sec] > start publishing ' + pub.path .replace(config.root, '') + ' < ' + jsonPath
          console.log(i + ' [' + d + 'sec] > start publishing ' + pub.path.replace(_cli.config.root, '') + ' < ' + jsonPath);
          // resolve()
          // return
          console.log(pConfig);
          (0, _cli.save)(pub.path, json.abe_meta.template, null, '', pConfig.TYPE, null, pConfig.TYPE, true).then(function () {
            // logsPub += 'successfully update > ' + pub.path .replace(config.root, '')
            // console.log('successfully update > ' + pub.path .replace(config.root, ''))
            resolve();
          }).catch(function (e) {
            console.log(e);
            // log.write('publish-all', e)
            console.log('publish-all', e);
            // log.write('publish-all', 'ERROR on ' + pub.path .replace(config.root, ''))
            console.log('publish-all', 'ERROR on ' + pub.path.replace(_cli.config.root, ''));
            resolve();
          });
        });
        promises.push(p);
      }
    });

    // logsPub += 'total ' + promises.length + ' files'
    console.log('total ' + promises.length + ' files');

    Promise.all(promises).then(function () {
      dateStart = (new Date().getTime() - dateStart.getTime()) / 1000;
      // logsPub += 'publish process finished in ' + dateStart + 'sec'
      console.log('publish process finished in ' + dateStart + 'sec');
      // log.write('publish-all', logsPub)
      // console.log('publish-all', logsPub)
      process.exit(0);
    }).catch(function (e) {
      // log.write('publish-all', e)
      console.log('publish-all', e);
      console.log(e);
    });
  } catch (e) {
    // statements
    console.log(e);
    // log.write('publish-all', e)
    console.log('publish-all', e);
  }
} else {
  console.log('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website');
  process.exit(0);
}