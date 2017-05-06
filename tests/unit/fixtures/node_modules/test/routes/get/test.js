'use strict';

var route = function route(req, res, next, abe) {
  res.set('Content-Type', 'text/html');
  return res.send('test');
}

exports.default = route