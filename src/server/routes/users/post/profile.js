import {
  User
} from '../../../../cli'

var route = function(req, res) {
	var decoded = User.utils.decodeUser(req, res)
	var user = User.utils.findSync(decoded.iss)
	var body = req.body

	if(body.oldpassword != null
		&& body.password != null
		&& body['repeat-password'] != null) {

		if (body.password !== body['repeat-password']) {
			return res.status(200).json({
				success: 0,
				message: 'password must be the same'
			})
		}

		if (!User.utils.isValid(user, body.oldpassword)) {
			return res.status(200).json({
				success: 0,
				message: 'Wrong password'
			})
		}else {
			var toUpdate = {
				id: user.id,
				password: body.password,
				username: user.username
			}
			var resultUpdatePassword = User.operations.updatePassword(toUpdate, toUpdate.password)
		}
	}

	delete body.password
	delete body._csrf
	delete body.oldpassword
	delete body['repeat-password']
	body.id = user.id

	var resultUpdate = User.operations.update(body)
	return res.status(200).json(resultUpdate)
}

export default route