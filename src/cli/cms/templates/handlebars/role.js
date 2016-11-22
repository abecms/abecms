import Cookies from 'cookies'
import jwt from 'jwt-simple'

import {
  config,
	User
} from '../../../'

/**
 * Handlebars helper, to print className and escape it string
 */
export default function role(role, obj, ctx) {
  if(typeof obj.express !== 'undefined' && obj.express !== null) {
    var cookies = new Cookies(obj.express.req, obj.express.res, {
      secure: config.cookie.secure
    })
    var token = cookies.get('x-access-token');

    if(typeof token !== 'undefined' && token !== null && token !== '') {
      var secret = config.users.secret
      var decoded = jwt.decode(token, secret);

      var user = User.findSync(decoded.iss)

      var roles = config.users.roles
      var cpt = 0;
      var cptUser = 0;
      var cptRole = 0;
      Array.prototype.forEach.call(roles, (currentRole) => {
        if(currentRole.workflow === user.role.workflow) {
          cptUser = cpt
        }
        if(currentRole.workflow === role) {
          cptRole = cpt
        }
        cpt++;
      })

      if(cptRole > cptUser) {
        return '';
      }
    }

    var content = ctx.fn(this)
    return content
      
  }else {
    return '';
  }
}
