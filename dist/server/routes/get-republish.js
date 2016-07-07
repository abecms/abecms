'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  (0, _cli.abeProcess)('publish-all', ['']);

  var result = {
    success: 1
  };
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(result));
};

exports.default = route;