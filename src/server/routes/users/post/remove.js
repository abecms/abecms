import fs from 'fs'
import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  abeExtend,
  config,
  User
} from '../../../../cli'

var route = function(req, res, next) {
  User.remove(req.body.id);
  return res.status(200).json({ sucess: 1 });
}

export default route