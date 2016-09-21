'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = (0, _cli.cleanSlug)(req.body.filePath);
  var p = new Promise(function (resolve, reject) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(filePath), req.body.tplPath, req.body.json, '', 'draft', null, 'publish').then(function () {
      resolve();
    }).catch(function (e) {
      console.error(e);
    });
  });

  p.then(function (resSave) {
    (0, _cli.save)(_cli.fileUtils.getFilePath(req.body.filePath), req.body.tplPath, req.body.json, '', 'publish', resSave, 'publish').then(function (resSave) {
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
      _cli.Manager.instance.updateList();
      res.set('Content-Type', 'application/json');
      res.send(JSON.stringify(result));
    }).catch(function (e) {
      console.error('post-publish.js', e);
    });
  }).catch(function (e) {
    console.error('post-publish.js', e);
  });
};

exports.default = route;