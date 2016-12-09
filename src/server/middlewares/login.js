var middleware = function(req, res, next) {
  if( req.url.indexOf('/abe/') > -1) {
    var send = res.send
    res.send = function (string) {
      var body = string instanceof Buffer ? string.toString() : string
      body = body.replace(/<\/body>/g, function (w) {
        return '<input type=\'hidden\' id=\'globalCsrfToken\' value=\'' + res.locals._csrf + '\' /><script src=\'/abejs/scripts/user-login-compiled.js\'></script>' + w
      })
      body = body.replace(/<\/form>/g, function (w) {
        return '<input type=\'hidden\' name=\'_csrf\' value=\'' + res.locals._csrf + '\' />' + w
      })
      send.call(this, body)
    }
    // res.locals.csrfToken = token
    next()
  }else {
    next()
  }
}

export default middleware