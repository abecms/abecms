import {
  User
} from '../../../../cli'

var route = function(req, res) {
  return res.status(200).json(User.operations.add(req.body))
}

export default route