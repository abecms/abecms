import fs from 'fs'
import Cookies from 'cookies'
import moment from 'moment'
import Strategy from 'passport-local'
import flash from 'connect-flash'
import passport from 'passport'
import jwt from 'jwt-simple'

import {
  abeExtend,
  config,
  Handlebars,
  User
} from '../../../../cli'

/**
 * Strategy
 */
passport.use(new Strategy(
  function(username, password, done) {
    User.findByUsername(username, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false, { message: 'Incorrect username or password.' }); }
      if(!User.isValid(user, password)) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.find(id, function (err, user) {
    done(err, user);
  });
});

var route = function(req, res, next) {
  passport.authenticate(
    'local',
    { session: false},
    function(err, user, info) {
      var secret = config.users.secret
      if (err) { return next(err) }

      if (!user) {
        req.flash('info', info.message)
        return res.redirect('/abe/users/login');
        // return res.status(401).json({ error: info });
      }
      var expires = moment().add(7, 'days').valueOf();
      var token = jwt.encode({
        iss: user.id,
        exp: expires,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      }, secret);

      var cookies = new Cookies( req, res, {
        secure: config.cookie.secure
      })
      cookies.set( 'x-access-token', token )

      res.redirect('/abe/');
    })(req, res, next);
}

export default route