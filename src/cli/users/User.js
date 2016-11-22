var fs = require('fs');
var bcrypt = require('bcrypt-nodejs');
var config = require('./config');
var Cookies = require('cookies');
var jwt = require('jwt-simple');
var owasp = require('owasp-password-strength-test');
var xss = require('xss');

function getBdd() {
   return JSON.parse(fs.readFileSync(__dirname + '/../../../users/bdd.json', 'utf8'));
}

exports.findSync = function(id) {
  var bdd = getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === parseInt(id)) {
      return user;
    }
  }
  return null;
};

exports.find = function(id, done) {
  var bdd = getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === parseInt(id)) {
      return done(null, user);
    }
  }
  return done(null, null);
};

exports.findByUsername = function(username, done) {
  var bdd = getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (user.username === username) {
      return done(null, user);
    }
  }
  return done(null, null);
};

exports.findByEmail = function(email, done) {
  var bdd = getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (user.email === email) {
      return done(null, user);
    }
  }
  return done(null, null);
};

exports.findByResetPasswordToken = function(resetPasswordToken, done) {
  var bdd = getBdd()
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (user.resetPasswordToken === resetPasswordToken) {
      return done(null, user);
    }
  }
  return done(null, null);
};

exports.isValid = function(user, password) {
  var bdd = getBdd()
  if(user.actif === 1) {
    if(bcrypt.compareSync(password, user.password)) {
      return true
    }
  }
  return false;
};

exports.deactivate = function(id, abe) {
  var bdd = getBdd()
  id = parseInt(id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      bdd[i].actif = 0
    }
  }
  mkdirp(path.dirname(userBddUrl))
  abe.fse.writeJsonSync(__dirname + '/../../../users/bdd.json', bdd, { space: 2, encoding: 'utf-8' })
};

exports.activate = function(id, abe) {
  var bdd = getBdd()
  id = parseInt(id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      bdd[i].actif = 1
    }
  }

  abe.fse.writeJsonSync(__dirname + '/../../../users/bdd.json', bdd)
};

exports.remove = function(id, abe) {
  var bdd = getBdd()
  id = parseInt(id)
  var newBdd = []
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) !== id) {
      newBdd.push(user)
    }
  }
  bdd = newBdd;

  abe.fse.writeJsonSync(__dirname + '/../../../users/bdd.json', bdd)
};

exports.decodeUser = function(req, res, abe) {
  var decoded = {}
  var cookies = new Cookies(req, res, {
    secure: abe.config.cookie.secure
  })
  var token = cookies.get('x-access-token');
  if(typeof token !== 'undefined' && token !== null && token !== '') {
    try {
      var secret = config.getConfig('secret', abe);
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
var mustCommonPassword = [];
owasp.tests.required.push(function(password) {
  var shouldTest = mostCommon
  if (shouldTest && contains(mustCommonPassword, password.toLowerCase())) {
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

function textXss(newUser) {
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

function getRole(data, abe) {
  var roles = config.getConfig('roles', abe);
  Array.prototype.forEach.call(roles, (role) => {
    if(role.name === data.role) {
      data.role = role
    }
  })
}

function checkSameEmail(data, abe) {
  var emailAlreadyUsed = false
  var bdd = getBdd();
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

function commonPassword(data, abe) {
  var owaspConfig = config.getConfig('owasp', abe)
  owasp.config(owaspConfig);

  var owaspConfig = config.getConfig('owasp', abe)
  owasp.config(owaspConfig);
  var res = owasp.test(data.password)

  currentUserName = data.username;

  mustCommonPassword = config.getConfig('mustCommonPassword', abe);
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

exports.update = function(data, abe) {
  var xss = textXss(data)
  if(xss.success === 0) {
    return xss
  }
  var sameEmail = checkSameEmail(data)
  if(sameEmail.success === 0) {
    return sameEmail
  }

  getRole(data, abe);

  var bdd = getBdd();
  var id = parseInt(data.id);
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      Array.prototype.forEach.call(Object.keys(data), function(key) {
        user[key] = data[key];
      })
    }
  }

  abe.fse.writeJsonSync(__dirname + '/../../../users/bdd.json', bdd)

  return {
    success:1,
    user: data
  }
};

exports.updatePassword = function(data, password, abe) {
  var cPassword = commonPassword(data, abe)
  if(cPassword.success === 0) {
    return cPassword
  }

  var salt = bcrypt.genSaltSync(10);

  var bdd = getBdd();
  var id = parseInt(data.id);
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i];
    if (parseInt(user.id) === id) {
      user.password = bcrypt.hashSync(password, salt);
    }
  }

  abe.fse.writeJsonSync(__dirname + '/../../../users/bdd.json', bdd)
  
  return {
    success:1,
    user: data
  }
}

exports.add = function(newUser, abe) {
  var xss = textXss(newUser)
  if(xss.success === 0) {
    return xss
  }
  var sameEmail = checkSameEmail(newUser)
  if(sameEmail.success === 0) {
    return sameEmail
  }

  getRole(newUser, abe);
  var bdd = getBdd()
  var lastId = 0
  for (var i = 0, len = bdd.length; i < len; i++) {
    lastId = parseInt(bdd[i].id)
  }
  newUser.id = lastId+1;
  newUser.actif = 0;
  var cPassword = commonPassword(newUser, abe)
  if(cPassword.success === 0) {
    return cPassword
  }

  var salt = bcrypt.genSaltSync(10);
  newUser.password = bcrypt.hashSync(newUser.password, salt);
  bdd.push(newUser);
  abe.fse.writeJsonSync(__dirname + '/../../../users/bdd.json', bdd)
  
  return {
    success:1,
    user: newUser
  }
};

exports.getAll = function(abe) {
  var bdd = getBdd()
  return bdd;
};