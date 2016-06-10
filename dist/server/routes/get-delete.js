'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var filePath = (0, _cli.cleanSlug)(req.query.filePath);
  var dirPath = _cli.FileParser.deleteFile(filePath);

  var result = {
    success: 1,
    file: req.query.filePath
  };
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
};

exports.default = route;