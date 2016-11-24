import {
  User
} from '../../../../cli'

var route = function(req, res) {
  User.remove(req.body.id)
  return res.status(200).json({ sucess: 1 })
}

export default route