import Cookies from 'cookies'

import {config} from '../../../../cli'

var route = function route(req, res) {
  var cookies = new Cookies(req, res, {
    secure: config.cookie.secure
  })
  cookies.set('x-access-token', null)

  req.logout()
  res.redirect('/abe/users/login')
}

export default route
