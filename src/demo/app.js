import express from 'express'
import helmet from 'helmet'

import {createAuthMiddleware, resolveAuthConfig} from './auth'
import {createRateLimiter} from './rate-limit'
import {
  MAX_PAYLOAD_BYTES,
  schema,
  validateContent,
  ValidationError,
} from './schema'
import {engine, initRenderer, renderDemoPage} from './renderer'

export const DEFAULTS = {
  rateLimitWindowMs: 60000,
  rateLimitMax: 60,
  requestTimeoutMs: 5000,
}

const ALLOWED_ROUTES = {
  '/health': ['GET', 'HEAD'],
  '/schema': ['GET', 'HEAD'],
  '/render': ['POST'],
}

/** Probe endpoint: reachable without a credential. */
const UNAUTHENTICATED_ROUTES = ['/health']

function requestTimeout(timeoutMs) {
  return function (req, res, next) {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({error: 'timeout', message: 'Request timed out.'})
      }
      res.destroy()
    }, timeoutMs)
    timer.unref()
    res.on('close', () => clearTimeout(timer))
    next()
  }
}

/**
 * Build the public demo gateway.
 *
 * The gateway exposes three read-only-ish endpoints and nothing else. No ABECMS
 * back-office route, static asset, template browser, plugin, source, operation
 * or filesystem path is mounted here.
 *
 * @param {Object} options
 * @param {Object} [options.auth] result of `resolveAuthConfig`. When omitted it
 *   is resolved from `process.env`, which fails closed if no token is set.
 */
export function createApp(options = {}) {
  const settings = Object.assign({}, DEFAULTS, options)
  const auth = settings.auth || resolveAuthConfig(process.env)

  initRenderer()

  const app = express()

  app.disable('x-powered-by')
  app.disable('etag')
  app.set('trust proxy', settings.trustProxy === true)

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          'default-src': ["'none'"],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'none'"],
          'form-action': ["'none'"],
        },
      },
      crossOriginResourcePolicy: {policy: 'same-origin'},
      referrerPolicy: {policy: 'no-referrer'},
    }),
  )

  // No CORS layer at all: livingcolor.fr calls this gateway server to server.
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', 'noindex, nofollow')
    next()
  })

  app.use(requestTimeout(settings.requestTimeoutMs))

  // Rate limiting deliberately runs *before* authentication, so a failed or
  // absent credential still consumes the caller's budget. An attacker without a
  // token therefore gets no free path at all: they are throttled first, then
  // rejected with 401 long before any body parsing or ABECMS rendering — the
  // only expensive work in the process — can be reached.
  app.use(
    createRateLimiter({
      windowMs: settings.rateLimitWindowMs,
      max: settings.rateLimitMax,
    }),
  )

  // Method allowlist on the three published paths, 404 for everything else.
  // This runs before authentication on purpose: unknown and ABECMS back-office
  // paths answer 404 identically whether or not a valid token is presented, so
  // a credential never unlocks a wider route surface.
  app.use((req, res, next) => {
    const allowedMethods = ALLOWED_ROUTES[req.path]
    if (!allowedMethods) {
      res.status(404).json({error: 'not_found', message: 'Unknown endpoint.'})
      return
    }
    if (!allowedMethods.includes(req.method)) {
      res.setHeader('Allow', allowedMethods.join(', '))
      res
        .status(405)
        .json({error: 'method_not_allowed', message: 'Method not allowed.'})
      return
    }
    next()
  })

  app.use(
    createAuthMiddleware({
      enabled: auth.enabled,
      tokenDigest: auth.tokenDigest,
      exempt: UNAUTHENTICATED_ROUTES,
    }),
  )

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      engine,
      uptime: Math.round(process.uptime()),
    })
  })

  app.get('/schema', (req, res) => {
    res.status(200).json(schema)
  })

  app.post(
    '/render',
    (req, res, next) => {
      if (!req.is('application/json')) {
        res.status(415).json({
          error: 'unsupported_media_type',
          message: 'Content-Type must be application/json.',
        })
        return
      }
      next()
    },
    express.json({
      limit: MAX_PAYLOAD_BYTES,
      strict: true,
      type: 'application/json',
    }),
    (req, res, next) => {
      try {
        const content = validateContent(req.body)
        const html = renderDemoPage(content)
        res.status(200).json({html, content, engine})
      } catch (err) {
        next(err)
      }
    },
  )

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
      res
        .status(400)
        .json({error: err.code, message: err.message, field: err.field})
      return
    }
    if (err && err.type === 'entity.too.large') {
      res.status(413).json({
        error: 'payload_too_large',
        message: `Payload exceeds ${MAX_PAYLOAD_BYTES} bytes.`,
      })
      return
    }
    if (err && (err.type === 'entity.parse.failed' || err.status === 400)) {
      res
        .status(400)
        .json({error: 'invalid_json', message: 'Body is not valid JSON.'})
      return
    }
    if (err && err.status === 415) {
      res.status(415).json({
        error: 'unsupported_media_type',
        message: 'Content-Type must be application/json.',
      })
      return
    }
    console.error('[abe-demo] unexpected error:', err && err.message)
    res
      .status(500)
      .json({error: 'internal_error', message: 'Rendering failed.'})
  })

  return app
}
