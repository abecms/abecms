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
  User.activate(req.body.id);
  return res.status(200).json({ sucess: 1 });
}

export default route