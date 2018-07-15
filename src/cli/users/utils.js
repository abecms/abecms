import redis from 'redis'
import path from 'path'
import fse from 'fs-extra'
import Limiter from 'ratelimiter'
import owasp from 'owasp-password-strength-test'
import bcrypt from 'bcrypt-nodejs'
import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {User, config, coreUtils, cmsData} from '../../cli'

export function checkSameEmail(data) {
  var emailAlreadyUsed = false
  var bdd = User.manager.instance.get()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (user.email === data.email && parseInt(user.id) !== parseInt(data.id)) {
      emailAlreadyUsed = true
    }
  }

  if (emailAlreadyUsed === true) {
    return {
      success: 0,
      message: 'Email adress already exist'
    }
  } else {
    return {
      success: 1
    }
  }
}

export function getRole(data) {
  var roles = config.users.roles
  Array.prototype.forEach.call(roles, role => {
    if (role.name === data.role) {
      data.role = role
    }
  })

  return data
}

export function commonPassword(data) {
  var owaspConfig = config.users.owasp
  owasp.config(owaspConfig)
  var sameAsUser =
    typeof owaspConfig.sameAsUser !== 'undefined' &&
    owaspConfig.sameAsUser !== null
      ? owaspConfig.sameAsUser
      : true
  var mostCommon =
    typeof owaspConfig.mostCommon !== 'undefined' &&
    owaspConfig.mostCommon !== null
      ? owaspConfig.mostCommon
      : true
  var mostCommonPassword = config.users.mostCommonPassword
  owasp.tests.required.push(function(password) {
    if (
      mostCommon &&
      coreUtils.array.contains(mostCommonPassword, password.toLowerCase())
    ) {
      return 'the password used is too common.'
    }
  })

  var currentUserName = data.username
  owasp.tests.required.push(function(password) {
    var username = currentUserName
    var shouldTest = sameAsUser

    if (shouldTest) {
      if (password.toLowerCase() === username.toLowerCase()) {
        return 'username and password must be different.'
      }
      if (
        password.toLowerCase() ===
        username.toLowerCase().split('').reverse().join('')
      ) {
        return 'username and password must be different, not just inverted.'
      }
    }
  })

  var res = owasp.test(data.password)

  if (
    typeof res.errors !== 'undefined' &&
    res.errors !== null &&
    res.errors.length > 0
  ) {
    var message = ''
    Array.prototype.forEach.call(res.errors, error => {
      message += error + '<br />'
    })
    return {
      success: 0,
      message: message
    }
  } else {
    return {
      success: 1
    }
  }
}

export function encryptPassword(numb, password) {
  var salt = bcrypt.genSaltSync(numb)
  return bcrypt.hashSync(password, salt)
}

export function getUserRoutes(workflow) {
  var routes = config.users.routes
  var userRoles = []
  Array.prototype.forEach.call(Object.keys(routes), role => {
    if (role === workflow) {
      userRoles = routes[role]
    }
  })

  return userRoles
}

export function findSync(id) {
  var bdd = User.manager.instance.get()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (parseInt(user.id) === parseInt(id)) {
      return user
    }
  }
  return null
}

export function find(id, done) {
  var bdd = User.manager.instance.get()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (parseInt(user.id) === parseInt(id)) {
      return done(null, user)
    }
  }
  return done(null, null)
}

export function findByUsername(username, done) {
  var bdd = User.manager.instance.get()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (user.username === username) {
      return done(null, user)
    }
  }
  return done(null, null)
}

export function findByEmail(email, done) {
  var bdd = User.manager.instance.get()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (user.email === email) {
      return done(null, user)
    }
  }
  return done(null, null)
}

export function findByResetPasswordToken(resetPasswordToken, done) {
  var bdd = User.manager.instance.get()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (user.resetPasswordToken === resetPasswordToken) {
      return done(null, user)
    }
  }
  return done(null, null)
}

export function isValid(user, password) {
  if (user.actif === 1) {
    if (bcrypt.compareSync(password, user.password)) {
      return true
    }
  }
  return false
}

export function decodeUser(req, res) {
  var decoded = {}
  var token =
    User.utils.getTokenFromQuery(req, res) ||
    User.utils.getTokenFromCookies(req, res) ||
    User.utils.getTokenFromAuthHeader(req, res)

  if (typeof token !== 'undefined' && token !== null && token !== '') {
    try {
      var secret = config.users.secret
      decoded = jwt.decode(token, secret)
    } catch (err) {}
  }

  return decoded
}

export function getTokenFromQuery(req, res) {
  if (req.body && req.body.token) {
    return req.body.token
  } else if (req.query && req.query.token) {
    return req.query.token
  } else if (req.headers && req.headers['x-access-token']) {
    return req.headers['x-access-token']
  }
}

export function getTokenFromAuthHeader(req, res) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1]
  }
}

export function getTokenFromCookies(req, res) {
  var cookies = new Cookies(req, res, {
    secure: config.cookie.secure
  })
  return cookies.get('x-access-token')
}

// the last test !/^\/abe\//.test(currentRoute + '/') has a "+ '/'" to take /abe route into account
export function isAbeRestrictedUrl(currentRoute) {
  if (
    currentRoute.indexOf('/abe/users/forgot') > -1 ||
    currentRoute.indexOf('/abe/users/login') > -1 ||
    currentRoute.indexOf('/abe/users/reset') > -1 ||
    currentRoute.indexOf('/abe/rest/') > -1 ||
    !/^\/abe\//.test(currentRoute + '/')
  ) {
    return false
  }

  return true
}

export function isUserAllowedOnRoute(workflow, currentRoute) {
  var isAllowed = false

  if (config.users.enable) {
    if (
      currentRoute.indexOf('/abe/users/forgot') > -1 ||
      currentRoute.indexOf('/abe/users/login') > -1 ||
      !/^\/abe/.test(currentRoute)
    ) {
      return true
    }

    if (currentRoute.indexOf('/abe') === -1) {
      isAllowed = true
    }

    if (workflow != null) {
      var routes = config.users.routes
      if (
        typeof routes[workflow] !== 'undefined' &&
        routes[workflow] !== null
      ) {
        Array.prototype.forEach.call(routes[workflow], route => {
          var reg = new RegExp(route)
          if (reg.test(currentRoute)) {
            isAllowed = true
          }
        })
      }
    }
  } else {
    isAllowed = true
  }

  return isAllowed
}

export function getAll() {
  return User.manager.instance.get()
}

export function getUserWorkflow(status) {
  var flows = []

  function addFlow(flow, type, action) {
    type = type != null ? type : flow
    return {
      status: flow,
      url: `/abe/operations/${action}/${type}`
    }
  }

  if (config.users.enable) {
    var found = null
    Array.prototype.forEach.call(config.users.workflow, flow => {
      if (found != null) {
        flows.push(addFlow(flow, flow, 'submit'))
        found = null
      }

      if (status == flow) {
        found = flow
        if (flow != 'draft' && flow != 'publish') {
          flows.push(addFlow('reject', flow, 'reject'))
        }
        if (flow == 'publish') {
          flows.push(addFlow('edit', 'draft', 'edit'))
        } else {
          flows.push(addFlow('save', flow, 'edit'))
        }
      }
    })
    if (found != null) {
      flows.push(addFlow('save', 'publish', 'submit'))
    }
  } else {
    flows = [
      addFlow('draft', 'draft', 'submit'),
      addFlow('publish', 'publish', 'submit')
    ]
  }
  return flows
}

export function loginLimitTry(username) {
  var p = new Promise(resolve => {
    var isNexted = false
    try {
      var limiterConfig = config.users.limiter

      var client = redis.createClient()
      client.on('error', function() {
        if (!isNexted) {
          isNexted = true
          resolve()
        }
      })

      var limit = new Limiter({
        id: username,
        db: client,
        duration: limiterConfig.duration,
        max: limiterConfig.max
      })

      limit.get(function(err, limit) {
        if (err) {
          resolve()
        } else {
          resolve(limit)
        }
      })
    } catch (e) {
      resolve()
    }
  })

  return p
}

/**
 * getGravatarImage("bessong@gmail.com", ".jpg?s=200")
 * @param  {[type]} email [description]
 * @param  {[type]} args  [description]
 * @return {[type]}       [description]
 */
export function getGravatarImage(email, args) {
  args = args || ''
  var BASE_URL = '//www.gravatar.com/avatar/'
  return (BASE_URL + coreUtils.text.md5(email) + args).trim()
}

/**
 * getActivity()
 * @param  {[type]} email [description]
 * @param  {[type]} args  [description]
 * @return {[type]}       [description]
 */
export function getActivity() {
  const pathToActivity = path.join(config.root, config.users.activity.path)

  if (config.users.enable && config.users.activity.active) {
    if (fse.existsSync(path.join(pathToActivity, 'activity.json'))) {
      const acArray= cmsData.file.get(path.join(pathToActivity, 'activity.json'))
      return acArray
    }
  }

  return []
}

export function addActivity(activity) {
  const pathToActivity = path.join(config.root, config.users.activity.path)
  const pathToActivityFile = path.join(pathToActivity, 'activity.json')
  const acArray = getActivity()

  if (acArray.length >= config.users/activity.history) acArray.shift()
  acArray.push(activity)

  if (config.users.enable && config.users.activity.active) {
    fse.exists(pathToActivityFile, function(exists) {
      if (!exists) {
        fse.mkdir(path.join(pathToActivity), function() {
          fse.writeJson(
            pathToActivityFile,
            acArray,
            function(err) {
              if (err) console.log('save activity error: ', err)
            }
          )
        })
      } else {
        fse.writeJson(
          pathToActivityFile,
          acArray,
          function(err) {
            if (err) console.log('save activity error: ', err)
          }
        )
      }
    })
  }

  return acArray
}