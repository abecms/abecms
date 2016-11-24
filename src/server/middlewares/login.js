import redis from 'redis'
import Limiter from 'ratelimiter'

import {
  config
} from '../../cli'

var middleware = function(req, res, next) {
  var isNexted = false
  if( req.url === '/abe/users/login' && req.method === 'POST' ) {
    try {
      var username = req.body.username  
      var limiterConfig = config.users.limiter

      var client = redis.createClient()
      client.on('error', function() {
        if (!isNexted) {
          isNexted = true
          next()
        }
      })

      var limit = new Limiter({
        id: username,
        db: client,
        duration: limiterConfig.duration,
        max: limiterConfig.max
      })

      limit.get(function(err, limit) {
        if (err) return next(err)

        try {
          res.set('X-RateLimit-Limit', limit.total)
          res.set('X-RateLimit-Remaining', limit.remaining - 1)
          res.set('X-RateLimit-Reset', limit.reset)

          // all good
          console.log('remaining ', limit.remaining - 1, limit.total, username)
          if (limit.remaining) return next()

          // not good
          var after = limit.reset - (Date.now() / 1000) | 0
          res.set('Retry-After', after)
          res.send(429, 'Rate limit exceeded')
        } catch(e) {
          console.log('e', e)
          next()
        }
      })
    } catch(e) {
      console.log('e', e)
      next()
    }
  }else {
    var send = res.send
    res.send = function (string) {
      var body = string instanceof Buffer ? string.toString() : string
      body = body.replace(/<\/body>/g, function (w) {
        return '<input type=\'hidden\' id=\'globalCsrfToken\' value=\'' + token + '\' /><script src=\'/scripts/user-login-compiled.js\'></script>' + w
      })
      send.call(this, body)
    }
    var token = req.csrfToken()
    res.locals.csrfToken = token

    next()
  }
}

export default middleware