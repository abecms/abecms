'use strict';

var config = require('../../modules/config')
  , User = require('../../modules/User')
  , fs = require('fs')
  , Cookies = require('cookies')
  , jwt = require('jwt-simple');
var path = require('path');

var route = function route(req, res, next, abe) {
  abe.abeExtend.hooks.instance.trigger('beforeRoute', req, res, next);
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var htmlToSend = '';

  var login = path.join(__dirname + '/../../partials/users-list.html')
  var html = abe.coreUtils.file.getContent(login);

  var template = abe.Handlebars.compile(html, {noEscape: true})
  var roles = []
  var roles = config.getConfig('roles', abe);
  var tmp = template({
    users: User.getAll(),
    express: {
      req: req,
      res: res
    },
    config: JSON.stringify(abe.config),
    roles: roles
  })
  
  return res.send(tmp);
}

exports.default = route