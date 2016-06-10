'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cli = require('../../cli');

var site = new _cli.serveSite();

var route = function route(req, res, next) {
  _cli.Hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  if (!site.isStarted) site.start(_cli.config);
  res.set('Content-Type', 'application/json');
  res.send(JSON.stringify(site.infos));
};

exports.default = route;