import fs from 'fs-extra'
import path from 'path'
import bcrypt from 'bcrypt-nodejs'
import Cookies from 'cookies'
import jwt from 'jwt-simple'
import owasp from 'owasp-password-strength-test'
import xss from 'xss'
import mkdirp from 'mkdirp'

import {
  config,
  coreUtils,
  User
} from '../../cli'

export function readBddFile() {
  var bddFile = path.join(config.root, 'users', 'bdd.json')
  if (coreUtils.file.exist(bddFile)) {
    return JSON.parse(fs.readFileSync(bddFile, 'utf8'))
  }
  return null
}

export function writeBddFile(json) {
  var bddFile = path.join(config.root, 'users', 'bdd.json')
  mkdirp(path.dirname(bddFile))
  fs.writeJsonSync(bddFile, json, { space: 2, encoding: 'utf-8' })
}

export function getBdd() {
  var json = {}
  if (config.users.enable) {
    json = readBddFile()
    if (json == null) {
      // writeBddFile({})
      // mkdirp(path.dirname(bddFile))
      // fs.writeJsonSync(bddFile, [], { space: 2, encoding: 'utf-8' })
      var admin = add({
          "username": "admin",
          "name": "admin",
          "email": "admin@test.com",
          "password": "Adm1n@test",
          "role": {
            "workflow":"admin",
            "name":"Admin"
          }
        });
      activate(admin.user.id)

      json = readBddFile({})
      // json = JSON.parse(fs.readFileSync(bddFile, 'utf8'))

    }
  }
  return json;
}

export function getUserRoutes(workflow) {
  var routes = config.users.routes;
  var userRoles = []
  Array.prototype.forEach.call(Object.keys(routes), (role) => {
    if(role === workflow) {
      userRoles = routes[role]
    }
  })

  return userRoles
}

export function findSync(id) {
  var bdd = User.getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === parseInt(id)) {
      return user;
    }
  }
  return null;
};

export function find(id, done) {
  var bdd = User.getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === parseInt(id)) {
      return done(null, user);
    }
  }
  return done(null, null);
};

export function findByUsername(username, done) {
  var bdd = User.getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (user.username === username) {
      return done(null, user);
    }
  }
  return done(null, null);
};

export function findByEmail(email, done) {
  var bdd = User.getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (user.email === email) {
      return done(null, user);
    }
  }
  return done(null, null);
};

export function findByResetPasswordToken(resetPasswordToken, done) {
  var bdd = User.getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (user.resetPasswordToken === resetPasswordToken) {
      return done(null, user);
    }
  }
  return done(null, null);
};

// export function isValid(user, password) {
//   var bdd = User.getBdd()
//   if(user.actif === 1) {
//     if(bcrypt.compareSync(password, user.password)) {
//       return true
//     }
//   }
//   return false;
// };

export function deactivate(id) {
  var bdd = User.getBdd()
  id = parseInt(id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      bdd[i].actif = 0
    }
  }
  User.writeBddFile(bdd)
  return bdd
  // fs.writeJsonSync(path.join(config.root, 'users', 'bdd.json'), bdd, { space: 2, encoding: 'utf-8' })
};

export function activate(id) {
  var bdd = User.getBdd()
  id = parseInt(id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      bdd[i].actif = 1
    }
  }
  User.writeBddFile(bdd)
  return bdd
  // fs.writeJsonSync(path.join(config.root, 'users', 'bdd.json'), bdd)
};

export function remove(id) {
  var bdd = User.getBdd()
  id = parseInt(id)
  var newBdd = []
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) !== id) {
      newBdd.push(user)
    }
  }
  bdd = newBdd;
  User.writeBddFile(bdd)
  return bdd
  // fs.writeJsonSync(path.join(config.root, 'users', 'bdd.json'), bdd)
};

export function decodeUser(req, res) {
  var decoded = {}
  var cookies = new Cookies(req, res, {
    secure: config.cookie.secure
  })
  var token = cookies.get('x-access-token');
  if(typeof token !== 'undefined' && token !== null && token !== '') {
    try {
      var secret = config.users.secret;
      decoded = jwt.decode(token, secret);
    } catch (err) {}
  }

  return decoded;
};

function contains(arr, obj) {
  var i = arr.length;
  while (i--) {
      if (arr[i] === obj) {
          return true;
      }
  }
  return false;
}

var sameAsUser = true;
var mostCommon = true;
var mostCommonPassword = [];
owasp.tests.required.push(function(password) {
  var shouldTest = mostCommon
  if (shouldTest && contains(mostCommonPassword, password.toLowerCase())) {
    return "the password used is too common.";
  }
});

var currentUserName = '';
owasp.tests.required.push(function(password) {
  var username = currentUserName
  var shouldTest = sameAsUser

  if(shouldTest) {
    if (password.toLowerCase() === username.toLowerCase()) {
      return "username and password must be different.";
    }
    if (password.toLowerCase() === username.toLowerCase().split("").reverse().join("")) {
      return "username and password must be different, not just inverted.";
    }
  }
});

export function textXss(newUser) {
  var newUserStr = JSON.stringify(newUser);
  var testXSS = xss(newUserStr.replace(/[a-zA-Z0-9-]*?=\\[\"\'].*?[\"\']/g, ''), {
    whiteList: [],
    stripIgnoreTag: true,
    // stripIgnoreTagBody: ['script']
  });
  if(testXSS !== newUserStr){
    return {
      success:0,
      message: 'invalid characters'
    }
  }
  return {
    success:1
  }
}

function getRole(data) {
  var roles = config.users.roles;
  Array.prototype.forEach.call(roles, (role) => {
    if(role.name === data.role) {
      data.role = role
    }
  })

  return data
}

export function checkSameEmail(data) {
  var emailAlreadyUsed = false
  var bdd = User.getBdd();
  var email = data.email;
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (user.email === email && parseInt(user.id) !== parseInt(data.id)) {
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

export function commonPassword(data) {
  var owaspConfig = config.users.owasp
  owasp.config(owaspConfig);

  var owaspConfig = config.users.owasp
  owasp.config(owaspConfig);
  var res = owasp.test(data.password)

  currentUserName = data.username;

  mostCommonPassword = config.users.mostCommonPassword
  sameAsUser = (typeof owaspConfig.sameAsUser !== 'undefined' && owaspConfig.sameAsUser !== null) ? owaspConfig.sameAsUser : true;
  mostCommon = (typeof owaspConfig.mostCommon !== 'undefined' && owaspConfig.mostCommon !== null) ? owaspConfig.mostCommon : true;

  var res = owasp.test(data.password)

  if(typeof res.errors !== 'undefined' && res.errors !== null
      && res.errors.length > 0) {
    var message = '';
    Array.prototype.forEach.call(res.errors, (error) => {
      message += error + '<br />';
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

export function update(data) {
  var xss = User.textXss(data)
  if(xss.success === 0) {
    return xss
  }
  var sameEmail = User.checkSameEmail(data)
  if(sameEmail.success === 0) {
    return sameEmail
  }

  getRole(data);

  var bdd = User.getBdd();
  var id = parseInt(data.id);
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      Array.prototype.forEach.call(Object.keys(data), function(key) {
        user[key] = data[key];
      })
    }
  }
  User.writeBddFile(bdd)
  // fs.writeJsonSync(path.join(config.root, 'users', 'bdd.json'), bdd)

  return {
    success:1,
    user: data
  }
};

export function updatePassword(data, password) {
  var cPassword = User.commonPassword(data)
  if(cPassword.success === 0) {
    return cPassword
  }

  var salt = bcrypt.genSaltSync(10);

  var bdd = User.getBdd();
  var id = parseInt(data.id);
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      user.password = bcrypt.hashSync(password, salt);
    }
  }

  User.writeBddFile(bdd)
  // fs.writeJsonSync(path.join(config.root, 'users', 'bdd.json'), bdd)
  
  return {
    success:1,
    user: data
  }
}

export function add(newUser) {
  var xss = User.textXss(newUser)
  if(xss.success === 0) {
    return xss
  }
  var sameEmail = User.checkSameEmail(newUser)
  if(sameEmail.success === 0) {
    return sameEmail
  }

  getRole(newUser);
  var bdd = User.getBdd()
  var lastId = 0
  for (var i = 0, len = bdd.length; i < len; i++) {
    lastId = parseInt(bdd[i].id)
  }
  newUser.id = lastId+1;
  newUser.actif = 0;
  var cPassword = User.commonPassword(newUser)
  if(cPassword.success === 0) {
    return cPassword
  }

  var salt = bcrypt.genSaltSync(10);
  newUser.password = bcrypt.hashSync(newUser.password, salt);
  bdd.push(newUser);
  User.writeBddFile(bdd)
  // fs.writeJsonSync(path.join(config.root, 'users', 'bdd.json'), bdd)
  
  return {
    success:1,
    user: newUser
  }
};

export function getAll() {
  var bdd = User.getBdd()
  return bdd;
};