'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);

  _cli.log.write('duplicate', '********************************************');
  _cli.log.write('duplicate', 'selectTemplate: ' + req.query.selectTemplate);
  _cli.log.write('duplicate', 'filePath: ' + req.query.filePath);
  _cli.log.write('duplicate', 'tplName: ' + req.query.tplName);
  var p = (0, _cli.abeDuplicate)(req.query.oldFilePath, req.query.selectTemplate, req.query.filePath, req.query.tplName, req);

  p.then(function (resSave) {
    _cli.log.write('duplicate', 'success');
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
    _cli.log.write('duplicate', '[ ERROR ]' + e.stack);
    console.error(e.stack);
    reject();
  });
};

exports.default = route;