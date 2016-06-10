'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  _cli.config.save(req.query.website, req.query.json);
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(req.query.json));
};

exports.default = route;