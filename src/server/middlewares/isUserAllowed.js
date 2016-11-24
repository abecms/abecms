import {
  config,
  User
} from '../../cli'

var middleware = function(req, res, next) {
  if (!config.users.enable) {
    if (req.url.indexOf('/abe/users/login') > -1) {
      res.redirect('/abe')
      return
    }else {
      next()
      return
    }
  }

  if( req.url.indexOf('/abe/users/forgot') > -1 || req.url.indexOf('/abe/users/login') > -1 || !/^\/abe/.test(req.url)) {
    next()
    return
  }

  var isHtml = /text\/html/.test(req.get('accept')) ? true : false

  var decoded = User.utils.decodeUser(req, res)
  var user = User.utils.findSync(decoded.iss)

  if (User.utils.isUserAllowedOnRoute(user, req.url)) {
    res.user = user
    next()
  }else {
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
}

export default middleware