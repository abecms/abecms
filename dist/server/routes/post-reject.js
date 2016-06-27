'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var p = new Promise(function (resolve, reject) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(req.query.filePath), req.query.tplPath, req.query.json, '', 'draft', null, 'reject').then(function () {
      resolve();
    }).catch(function (e) {
      console.error(e.stack);
    });
  });

  p.then(function (resSave) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(req.query.filePath), req.query.tplPath, req.query.json, '', 'reject', resSave, 'reject').then(function (resSave) {
      if (typeof resSave.error !== 'undefined' && resSave.error !== null) {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({ error: resSave.error }));
      }
      var result;
      if (typeof resSave.reject !== 'undefined' && resSave.reject !== null) {
        result = resSave;
      }
      if (typeof resSave.json !== 'undefined' && resSave.json !== null) {
        result = {
          success: 1,
          json: resSave.json
        };
      }
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify(result));
    });
  }).catch(function (e) {
    console.error(e.stack);
  });
};

exports.default = route;