'use strict';

var config = require('../../modules/config')
  , moment = require('moment')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , User = require('../../modules/User')
  , Cookies = require( "cookies" )
  , jwt = require('jwt-simple')
  , flash = require('connect-flash');

/**
 * LocalStrategy
 */
passport.use(new LocalStrategy(
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

var route = function route(req, res, next, abe) {
  passport.authenticate(
    'local',
    { session: false},
    function(err, user, info) {
      var login = config.getConfig('login', abe);
      var secret = config.getConfig('secret', abe);
      var home = config.getConfig('home', abe);
      if (err) { return next(err) }

      if (!user) {
        req.flash('info', info.message)
        return res.redirect(login);
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
        secure: abe.config.cookie.secure
      })
      cookies.set( 'x-access-token', token )

      res.redirect(home);
    })(req, res, next);
}

exports.default = route