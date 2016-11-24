import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  config,
	User
} from '../../../'

/**
 * Handlebars helper, to print className and escape it string
 */
export default function getCurrentuserRole(obj) {
  if(typeof obj.express !== 'undefined' && obj.express !== null) {
    var cookies = new Cookies(obj.express.req, obj.express.res, {
      secure: config.cookie.secure
    })
    var token = cookies.get('x-access-token')
    if(typeof token !== 'undefined' && token !== null && token !== '') {
      var secret = config.users.secret
      var decoded = jwt.decode(token, secret)
      var user = User.findSync(decoded.iss)
      return user.role.workflow
    }
  }
  return ''
}
