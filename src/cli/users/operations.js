import {
  coreUtils
  ,User
} from '../../cli'

export function add(newUser) {
  var xss = coreUtils.text.checkXss(newUser)
  if(xss.success === 0) {
    return xss
  }
  var sameEmail = User.utils.checkSameEmail(newUser)
  if(sameEmail.success === 0) {
    return sameEmail
  }

  User.utils.getRole(newUser)
  var bdd = User.manager.instance.get()
  var lastId = 0
  for (var i = 0, len = bdd.length; i < len; i++) {
    lastId = parseInt(bdd[i].id)
  }
  newUser.id = lastId+1
  newUser.actif = 0
  newUser.avatar = User.utils.getGravatarImage(newUser.email, ".jpg?s=200")
  var cPassword = User.utils.commonPassword(newUser)
  if(cPassword.success === 0) {
    return cPassword
  }

  newUser.password = User.utils.encryptPassword(10, newUser.password)
  bdd.push(newUser)

  User.manager.instance.update(bdd)
  
  return {
    success:1,
    user: newUser
  }
}

export function deactivate(id) {
  var bdd = User.manager.instance.get()
  id = parseInt(id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (parseInt(user.id) === id) {
      bdd[i].actif = 0
    }
  }
  User.manager.instance.update(bdd)
  return bdd
}

export function activate(id) {
  var bdd = User.manager.instance.get()
  id = parseInt(id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (parseInt(user.id) === id) {
      bdd[i].actif = 1
    }
  }
  User.manager.instance.update(bdd)
  return bdd
}

export function remove(id) {
  var bdd = User.manager.instance.get()
  id = parseInt(id)
  var newBdd = []
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (parseInt(user.id) !== id) {
      newBdd.push(user)
    }
  }
  bdd = newBdd
  User.manager.instance.update(bdd)
  return bdd
}

export function update(data) {
  var xss = coreUtils.text.checkXss(data)
  if(xss.success === 0) {
    return xss
  }
  var sameEmail = User.utils.checkSameEmail(data)
  if(sameEmail.success === 0) {
    return sameEmail
  }

  User.utils.getRole(data)

  var bdd = User.manager.instance.get()
  var id = parseInt(data.id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (parseInt(user.id) === id) {
      Array.prototype.forEach.call(Object.keys(data), function(key) {
        user[key] = data[key]
      })
    }
  }
  bdd = User.manager.instance.update(bdd)

  return {
    success:1,
    user: data
  }
}

export function updatePassword(data, password) {
  var cPassword = User.utils.commonPassword(data)
  if(cPassword.success === 0) {
    return cPassword
  }

  var bdd = User.manager.instance.get()
  var id = parseInt(data.id)
  for (var i = 0, len = bdd.length; i < len; i++) {
    var user = bdd[i]
    if (parseInt(user.id) === id) {
      user.password = User.utils.encryptPassword(10, password)
    }
  }

  bdd = User.manager.instance.update(bdd)
  
  return {
    success:1,
    user: data
  }
}
