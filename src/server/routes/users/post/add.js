import {
  User
} from '../../../../cli'

var route = function(req, res) {
  var resultAdd = User.add(req.body)
  return res.status(200).json(resultAdd)
}

export default route