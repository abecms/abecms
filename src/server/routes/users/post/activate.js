'use strict';

var config = require('../../modules/config')
  , User = require('../../modules/User')
  , fs = require('fs')
  , Cookies = require('cookies')
  , jwt = require('jwt-simple');

var route = function route(req, res, next, abe) {
  abe.abeExtend.hooks.instance.trigger('beforeRoute', req, res, next);
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var cookies = new Cookies(req, res, {
    secure: abe.config.cookie.secure
  })
  var token = cookies.get('x-access-token');

  if(typeof token !== 'undefined' && token !== null && token !== '') {
    try {
      var secret = config.getConfig('secret', abe);
      var decoded = jwt.decode(token, secret);

      User.find(decoded.iss, function(err, user) {

        var manage = config.getConfig('manage', abe);
        if(err || manage.indexOf(user.role.workflow) === -1) {
          return res.status(401).send('Not authorized !');
        }

        User.activate(req.body.id, abe);

        return res.status(200).json({ sucess: 1 });
      })

    } catch (err) {
      return res.status(401).send('Not authorized !');
    }
  }else {
    return res.status(401).send('Not authorized !');
  }
}

exports.default = route