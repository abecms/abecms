import {
  config,
  User
} from '../../cli'

var middleware = function(req, res, next) {
  if (!config.users.enable) {
    if (req.url.indexOf('/abe/users/login') > -1) {
      res.redirect('/abe/editor')
      return
    }else {
      next()
      return
    }
  }

  var decoded = User.utils.decodeUser(req, res)
  var user = User.utils.findSync(decoded.iss)
  res.user = user

  if(!User.utils.isAbeRestrictedUrl(req.url)) {
    // if (user != null && req.url.indexOf('/abe/users/login') > -1 && req.method === 'GET' ) {
    //   res.redirect('/abe/editor')
    //   return
    // }else {
      next()
      return
    // }
  }

  var isHtml = /text\/html/.test(req.get('accept')) ? true : false

  if (user != null && User.utils.isUserAllowedOnRoute(user.role.workflow, req.url)) {
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