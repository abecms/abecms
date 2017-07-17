import {User} from '../../../'

/**
 * Handlebars helper, to print className and escape it string
 */
export default function isAuthorized(route, role, ctx) {
  if (User.utils.isUserAllowedOnRoute(role, route)) {
    return ctx.fn(this)
  } else {
    return ctx.inverse(this)
  }
}
