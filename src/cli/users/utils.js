import owasp from 'owasp-password-strength-test'
import bcrypt from 'bcrypt-nodejs'
import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  User
  ,config
  ,coreUtils
} from '../../cli'

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
      success:0,
      message: 'Email adress already exist'
    }
  }else {
    return {
      success:1
    }
  }
}

export function getRole(data) {
  var roles = config.users.roles
  Array.prototype.forEach.call(roles, (role) => {
    if(role.name === data.role) {
      data.role = role
    }
  })

  return data
}

export function commonPassword(data) {
  var owaspConfig = config.users.owasp
  owasp.config(owaspConfig)
  var sameAsUser = (typeof owaspConfig.sameAsUser !== 'undefined' && owaspConfig.sameAsUser !== null) ? owaspConfig.sameAsUser : true
  var mostCommon = (typeof owaspConfig.mostCommon !== 'undefined' && owaspConfig.mostCommon !== null) ? owaspConfig.mostCommon : true
  var mostCommonPassword = config.users.mostCommonPassword
  owasp.tests.required.push(function(password) {
    if (mostCommon && coreUtils.array.contains(mostCommonPassword, password.toLowerCase())) {
      return 'the password used is too common.'
    }
  })

  var currentUserName = data.username
  owasp.tests.required.push(function(password) {
    var username = currentUserName
    var shouldTest = sameAsUser

    if(shouldTest) {
      if (password.toLowerCase() === username.toLowerCase()) {
        return 'username and password must be different.'
      }
      if (password.toLowerCase() === username.toLowerCase().split('').reverse().join('')) {
        return 'username and password must be different, not just inverted.'
      }
    }
  })

  var res = owasp.test(data.password)

  if(typeof res.errors !== 'undefined' && res.errors !== null
      && res.errors.length > 0) {
    var message = ''
    Array.prototype.forEach.call(res.errors, (error) => {
      message += error + '<br />'
    })
    return {
      success:0,
      message: message
    }
  }else {
    return {
      success:1
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
  Array.prototype.forEach.call(Object.keys(routes), (role) => {
    if(role === workflow) {
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
  if(user.actif === 1) {
    if(bcrypt.compareSync(password, user.password)) {
      return true
    }
  }
  return false
}

export function decodeUser(req, res) {
  var decoded = {}
  var token = User.utils.getTokenFromCookies(req, res)
  if(typeof token !== 'undefined' && token !== null && token !== '') {
    try {
      var secret = config.users.secret
      decoded = jwt.decode(token, secret)
    } catch (err) {}
  }

  return decoded
}

export function getTokenFromCookies(req, res) {
  var cookies = new Cookies(req, res, {
    secure: config.cookie.secure
  })
  return cookies.get('x-access-token')
}

export function isUserAllowedOnRoute(workflow, currentRoute) {
  var isAllowed = false

  if (currentRoute.indexOf('abe/') === -1) {
    isAllowed = true
  }

  if (workflow != null) {
    var routes = config.users.routes
    if(typeof routes[workflow] !== 'undefined' && routes[workflow] !== null) {
      Array.prototype.forEach.call(routes[workflow], (route) => {
        var reg = new RegExp(route)
        if(reg.test(currentRoute)) {
          isAllowed = true
        }
      })
    }
  }
  
  return isAllowed
}

export function getAll() {
  return User.manager.instance.get()
}

export function getUserWorkflow(status, role) {
  var flows = []

  function addFlow (flow, type, action) {
    type = (type != null) ? type : flow
    return {
      status: flow,
      url: `/abe/save/${type}/${action}`
    }
  }

  if (config.users.enable) {
    var before = null
    var found = false
    Array.prototype.forEach.call(config.users.workflow, (flow) => {
      if (found) {
        flows.push(addFlow(flow, flow, "submit"))
        found = false
      }
      if (status == flow) {
        found = true
        if (before != null) {
          if (flow == "publish") {
            flows.push(addFlow("edit", "draft", "submit"))
          }else {
            flows.push(addFlow("reject", before, "reject"))
          }
        }
        flows.push(addFlow(flow, flow, "edit"))
      }
      before = flow
    })
  }else {
    flows = [addFlow("draft", "draft", "submit"), addFlow("publish", "publish", "submit")]
  }
  return flows
}