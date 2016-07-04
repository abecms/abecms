'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);

  _cli.log.write('update', 'selectTemplate: ' + req.query.selectTemplate);
  _cli.log.write('update', 'filePath: ' + req.query.filePath);
  _cli.log.write('update', 'tplName: ' + req.query.tplName);
  var p = (0, _cli.abeDuplicate)(req.query.oldFilePath, req.query.selectTemplate, req.query.filePath, req.query.tplName, req, true);

  p.then(function (resSave) {
    _cli.log.write('update', 'success');
    var result = {
      success: 1,
      json: resSave
    };
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  }, function () {
    var result = {
      success: 0
    };
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(result));
  }).catch(function (e) {
    reject();
    _cli.log.write('update', '[ ERROR ]' + e);
    console.error(e);
  });
};

exports.default = route;