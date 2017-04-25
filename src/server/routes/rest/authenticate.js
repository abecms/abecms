import Cookies from 'cookies'
import moment from 'moment'
import Strategy from 'passport-local'
import passport from 'passport'
import jwt from 'jwt-simple'

import {
  config,
  User
} from '../../../cli'

/**
 * Strategy
 */
passport.use(new Strategy(
  function(username, password, done) {
    User.utils.findByUsername(username, function(err, user) {
      if (err) { return done(err) }
      if (!user) { return done(null, false, { message: 'Incorrect username or password.' }) }
      if(!User.utils.isValid(user, password)) {
        return done(null, false, { message: 'Incorrect username or password.' })
      }
      return done(null, user)
    })
  }
))

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.utils.find(id, function (err, user) {
    done(err, user)
  })
})

var route = function(req, res, next) {
  User.utils.loginLimitTry(req.body.username)
  .then((limit) => {
    if (limit != null) {
      // all good
      if (!limit.remaining) {
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid credentials. Rate limit exceeded"
        });
        return;
      }
    }

    passport.authenticate(
      'local',
      { session: false},
      function(err, user, info) {
        var secret = config.users.secret
        if (err) { return next(err) }

        if (!user) {
          res.status(401);
          res.json({
            "status": 401,
            "message": "Invalid credentials"
          });
          return;
        }
        var expires = moment().add(7, 'days').valueOf()
        var token = jwt.encode({
          iss: user.id,
          exp: expires,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        }, secret)

        var cookies = new Cookies( req, res, {
          secure: config.cookie.secure
        })
        cookies.set( 'x-access-token', token )

        var result = {id_token:token}
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify(result))
      })(req, res, next)
  })
}

export default route