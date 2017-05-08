import {
  User
} from '../../../../cli'

var route = function(req, res) {
  var decoded = User.utils.decodeUser(req, res)
  var user = User.utils.findSync(decoded.iss)
  var body = req.body

  if(body.oldpassword != null && body.oldpassword != ''
		&& body.password != null && body.password != ''
		&& body['repeat-password'] != null && body['repeat-password'] != '') {

    if (body.password !== body['repeat-password']) {
      req.flash('error', 'password must be the same')
      return res.redirect('/abe/users/profile')
    }

    if (!User.utils.isValid(user, body.oldpassword)) {
      req.flash('error', 'Wrong password')
      return res.redirect('/abe/users/profile')
    }else {
      var toUpdate = {
        id: user.id,
        password: body.password,
        username: user.username
      }
      var resultUpdatePassword = User.operations.updatePassword(toUpdate, toUpdate.password)
      if(resultUpdatePassword.success === 0) {
        req.flash('error', resultUpdatePassword.message)
        return res.redirect('/abe/users/profile')
      }
    }
  }

  delete body.password
  delete body._csrf
  delete body.oldpassword
  delete body['repeat-password']
  body.id = user.id

  var resultUpdate = User.operations.update(body)
  req.flash('info', 'Profile updated')
  return res.redirect('/abe/users/profile')
}

export default route