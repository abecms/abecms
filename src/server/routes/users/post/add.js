import fs from 'fs'
import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  abeExtend,
  config,
  Handlebars,
  User
} from '../../../../cli'

var route = function(req, res, next) {
  var resultAdd = User.add(req.body);
  return res.status(200).json(resultAdd);
}

export default route