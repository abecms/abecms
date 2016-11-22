import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  config,
  User
} from '../../cli'

var middleware = function(req, res, next) {
  if( req.url.indexOf('/abe/users/forgot') > -1 || req.url.indexOf('/abe/users/login') > -1 || !/^\/abe/.test(req.url)) {
    next();
    return;
  }

  var isHtml = /text\/html/.test(req.get('accept')) ? true : false
  var isAllowed = true

  var cookies = new Cookies(req, res, {
    secure: config.cookie.secure
  })
  var token = cookies.get('x-access-token');

  if(typeof token !== 'undefined' && token !== null && token !== '') {
    try {
      var secret = config.users.secret
      var decoded = jwt.decode(token, secret);

      if (decoded.exp <= Date.now()) {
        // res.end('Access token has expired', 400);
        isAllowed = false
      }

      var user = User.findSync(decoded.iss)

      var allowed = false
      var routes = config.users.routes
      if(typeof routes[user.role.workflow] !== 'undefined' && routes[user.role.workflow] !== null) {
        Array.prototype.forEach.call(routes[user.role.workflow], (route) => {
          var reg = new RegExp(route)
          if(reg.test(req.url)) {
            allowed = true
          }
        })
      }
      if(!allowed) {
        isAllowed = false
      }
    } catch (err) {
      isAllowed = false
    }
  }else {
    isAllowed = false
  }

  if(!isAllowed) {
    if(isHtml) {
      res.redirect('/abe/users/login')
    }else {
      var notAuthorized = {
        success: 0,
        message: 'Not authorized !'
      }
      res.set('Content-Type', 'application/json')
      res.send(JSON.stringify(notAuthorized))
    }
  }else {
    next();
  }
}

export default middleware