import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  config,
  User
} from '../../cli'

function notAllowed(res, isHtml) {
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
}

var middleware = function(req, res, next) {
  if (!config.users.enable) {
    if (req.url.indexOf('/abe/users/login') > -1) {
      res.redirect('/abe')
      return
    }else {
      next();
      return;
    }
  }

  if( req.url.indexOf('/abe/users/forgot') > -1 || req.url.indexOf('/abe/users/login') > -1 || !/^\/abe/.test(req.url)) {
    next();
    return;
  }

  var isHtml = /text\/html/.test(req.get('accept')) ? true : false
  var isAllowed = true

  var decoded = User.decodeUser(req, res)
  var user = User.findSync(decoded.iss)

  if (user != null) {
    res.user = user
    
    var routes = config.users.routes
    if(typeof routes[user.role.workflow] !== 'undefined' && routes[user.role.workflow] !== null) {
      Array.prototype.forEach.call(routes[user.role.workflow], (route) => {
        var reg = new RegExp(route)
        if(reg.test(req.url)) {
          isAllowed = false
        }
      })
    }
  }else {
    isAllowed = false
  }

  if(!isAllowed) {
    notAllowed(res, isHtml)
  }else {
    next();
  }
}

export default middleware