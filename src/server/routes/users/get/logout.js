'use strict';

var config = require('../../modules/config')
  , Cookies = require('cookies')
  , moment = require('moment');

var route = function route(req, res, next, abe) {
  var expires = moment().valueOf();

  var cookies = new Cookies( req, res, {
  	secure: abe.config.cookie.secure
  })
  cookies.set( 'x-access-token', null )

  req.logout();
  var login = config.getConfig('login', abe);
  res.redirect(login);
}

exports.default = route