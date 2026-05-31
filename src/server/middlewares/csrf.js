import {doubleCsrf} from 'csrf-csrf'

import {config} from '../../cli'

const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => config.sessionSecret,
  getSessionIdentifier: req => req.sessionID || req.session?.id || req.ip,
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.cookie.secure,
    path: '/',
  },
  getTokenFromRequest: req =>
    req.body?._csrf ||
    req.query?._csrf ||
    req.headers['x-csrf-token'] ||
    req.headers['X-CSRF-Token'],
})

function attachCsrfToken(req, res, next) {
  req.csrfToken = () => generateCsrfToken(req, res)

  if (req.url.indexOf('/abe/') > -1) {
    const token = generateCsrfToken(req, res)
    res.locals._csrf = token
    res.locals.csrfToken = token
  }

  next()
}

export {invalidCsrfTokenError, doubleCsrfProtection, attachCsrfToken}
