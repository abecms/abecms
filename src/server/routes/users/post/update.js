import fs from 'fs'
import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  abeExtend,
  Handlebars,
  config,
  User
} from '../../../../cli'

var route = function(req, res, next) {
  var resultUpdate = User.update(req.body);
  return res.status(200).json(resultUpdate);
}

export default route