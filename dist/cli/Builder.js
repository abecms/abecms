'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _Save = require('./controllers/Save');

var _ = require('./');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Builder = function Builder(root, folder, dest, flow) {
  _classCallCheck(this, Builder);

  this.pathToJson = _.fileUtils.concatPath(root, _.config.data.url);
  var files = _.fileAttr.filterLatestVersion(_.FileParser.getFiles(this.pathToJson, _.config.data.url), flow);

  if (flow === 'publish') {
    files = _.FileParser.getFiles(_.fileUtils.concatPath(root, _.config.publish.url), new RegExp('.' + _.config.files.templates.extension));
    // files = FileParser.getMetas(files, 'draft')
  }

  var build = function build(index) {
    var file = files[index];
    if (file.path.indexOf('.' + _.config.files.templates.extension) > -1) {
      file.path = file.path.replace(_.config.publish.url, _.config.data.url).replace('.' + _.config.files.templates.extension, '.json');

      var json = _fsExtra2.default.readJsonSync(file.path);
      var text = (0, _.getTemplate)(json.abe_meta.template);

      _.Util.getDataList(_.fileUtils.removeLast(json.abe_meta.link), text, json).then(function () {
        var page = new _.Page(json.abe_meta.link, text, json, true);
        (0, _Save.saveHtml)(_.fileUtils.concatPath(root, dest + json.abe_meta.link), page.html);
        if (files[index + 1]) build(index + 1);
      }).catch(function (e) {
        console.error(e);
        if (files[index + 1]) build(index + 1);
      });
    } else if (file.path.indexOf('.json') > -1) {
      var json = _fsExtra2.default.readJsonSync(file.path);
      var text = (0, _.getTemplate)(json.abe_meta.template);

      _.Util.getDataList(_.fileUtils.removeLast(json.abe_meta.link), text, json).then(function () {
        var page = new _.Page(json.abe_meta.link, text, json, true);
        (0, _Save.saveHtml)(_.fileUtils.concatPath(root, dest + json.abe_meta.link), page.html);
        if (files[index + 1]) build(index + 1);
      }).catch(function (e) {
        console.error(e);
        if (files[index + 1]) build(index + 1);
      });
    } else if (files[index + 1]) build(index + 1);
  };

  build(0);
};

if (process.env.ROOT && process.env.FOLDER && process.env.DEST) {
  _.config.set({ root: process.env.ROOT });
  var dest = process.env.DEST || 'tmp';
  var flow = process.env.FLOW || 'draft';
  new Builder(process.env.ROOT, process.env.FOLDER, dest, flow);
}