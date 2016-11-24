import {
  config,
	User
} from '../../../'

/**
 * Handlebars helper, to print className and escape it string
 */
export default function isAuthorized(route, role, ctx) {
  var isAuthorized = true

  if (config.users.enable) {
    var allowedRoutes = User.utils.getUserRoutes(role)
    Array.prototype.forEach.call(allowedRoutes, (allowedRoute) => {
      var reg = new RegExp(allowedRoute)
      if (reg.test(route)) {
        isAuthorized = false
      }
    })
  }

  if (isAuthorized) {
    return ctx.fn(this)
  }else {
    return ctx.inverse(this)
  }
}
