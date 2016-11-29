var middleware = function(req, res, next) {
  if( req.url.indexOf('/abe/') > -1) {
    var send = res.send
    var token = req.csrfToken()
    res.send = function (string) {
      var body = string instanceof Buffer ? string.toString() : string
      body = body.replace(/<\/body>/g, function (w) {
        return '<input type=\'hidden\' id=\'globalCsrfToken\' value=\'' + token + '\' /><script src=\'/scripts/user-login-compiled.js\'></script>' + w
      })
      send.call(this, body)
    }
    res.locals.csrfToken = token
    next()
  }else {
    next()
  }
}

export default middleware