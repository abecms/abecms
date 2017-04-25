var middleware = function(err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err)
  } else {
    if( req.url.indexOf('/abe/users/forgot') > -1 ||
        req.url.indexOf('/abe/users/login') > -1 ||
        req.url.indexOf('/abe/rest/') > -1 ||
        !/^\/abe/.test(req.url) ||
        !/^\/abe/.test(req.url) ||
        typeof req.header('Referer') === 'undefined' // to be removed once all routes are under /abe/rest
      ) {
      return next()
    }
  }

  var isHtml = /text\/html/.test(req.get('accept')) ? true : false
  if(isHtml) {
    res.redirect('/abe/users/login')
  } else {
    var notAuthorized = {
      success: 0,
      message: 'form tampered with !'
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(notAuthorized))
  }
}

export default middleware