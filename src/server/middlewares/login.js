var middleware = function(req, res, next) {
  if (req.url.indexOf('/abe/') > -1 && req.url.indexOf('/abe/rest/') < 0) {
    var send = res.send
    res.send = function(string) {
      if (typeof string === 'string' || string instanceof Buffer) {
        var body = string instanceof Buffer ? string.toString() : string
        body = body.replace(/<\/body>/g, function(w) {
          return (
            "<input type='hidden' id='globalCsrfToken' value='" +
            res.locals._csrf +
            "' /><script src='/abecms/scripts/user-login-compiled.js'></script>" +
            w
          )
        })
        body = body.replace(/<\/form>/g, function(w) {
          return (
            "<input type='hidden' name='_csrf' value='" +
            res.locals._csrf +
            "' />" +
            w
          )
        })
        send.call(this, body)
      } else {
        send.call(this, string)
      }
    }
    // res.locals.csrfToken = token
    next()
  } else {
    next()
  }
}

export default middleware
