import crypto from 'crypto'

/**
 * Server-to-server bearer authentication for the demo gateway.
 *
 * The token is a shared secret between the livingcolor.fr backend and this
 * gateway. It is never logged, never echoed in a response and never compared
 * with a short-circuiting string comparison.
 */

/** Minimum accepted token length. Generate with `openssl rand -hex 32`. */
export const MIN_TOKEN_LENGTH = 32

/** RFC 6750 b64token. */
const BEARER_RE = /^Bearer[ ]+([A-Za-z0-9\-._~+/]+=*)$/i

const UNAUTHORIZED = Object.freeze({
  error: 'unauthorized',
  message: 'A valid bearer token is required.',
})

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest()
}

/**
 * Resolve the authentication configuration, failing closed.
 *
 * @param {Object} env process environment
 * @returns {{enabled: boolean, tokenDigest: Buffer|null}}
 * @throws {Error} when no token is configured and no explicit opt-out is set
 */
export function resolveAuthConfig(env = {}) {
  const token = (env.ABE_DEMO_API_TOKEN || '').trim()
  const allowUnauthenticated = env.ABE_DEMO_ALLOW_UNAUTHENTICATED === 'true'

  if (token === '') {
    if (!allowUnauthenticated) {
      throw new Error(
        'ABE_DEMO_API_TOKEN is not set. Set it to a secret of at least ' +
          `${MIN_TOKEN_LENGTH} characters, or set ` +
          'ABE_DEMO_ALLOW_UNAUTHENTICATED=true for local development only.',
      )
    }
    return {enabled: false, tokenDigest: null}
  }

  if (token.length < MIN_TOKEN_LENGTH) {
    // The token value itself is deliberately absent from this message.
    throw new Error(
      `ABE_DEMO_API_TOKEN must be at least ${MIN_TOKEN_LENGTH} characters.`,
    )
  }

  return {enabled: true, tokenDigest: sha256(token)}
}

/**
 * Extract the bearer token from a request.
 *
 * Returns null for an absent, duplicated or malformed Authorization header.
 * Duplicated headers are rejected outright: Node keeps only the first
 * Authorization line, so accepting them would let a caller smuggle a second
 * credential past this check.
 */
function readBearerToken(req) {
  const raw = req.rawHeaders || []
  let occurrences = 0
  for (let i = 0; i < raw.length; i += 2) {
    if (String(raw[i]).toLowerCase() === 'authorization') occurrences += 1
  }
  if (occurrences !== 1) return null

  const header = req.headers.authorization
  if (typeof header !== 'string') return null

  const match = BEARER_RE.exec(header)
  return match ? match[1] : null
}

/**
 * Build the authentication middleware.
 *
 * `exempt` paths stay open; everything else requires a valid bearer token.
 * Every failure mode — absent, malformed, duplicated or wrong token — returns
 * the exact same generic 401 so the endpoint is not an oracle.
 */
export function createAuthMiddleware({enabled, tokenDigest, exempt = []}) {
  const exemptPaths = new Set(exempt)

  return function authenticate(req, res, next) {
    if (exemptPaths.has(req.path)) {
      next()
      return
    }

    // Responses differ per credential, and are already no-store.
    res.setHeader('Vary', 'Authorization')

    if (!enabled) {
      next()
      return
    }

    const presented = readBearerToken(req)
    const presentedDigest = sha256(presented === null ? '' : presented)

    // Always run the comparison, even when no token was presented, so the
    // response time does not depend on the failure mode.
    const ok =
      presented !== null && crypto.timingSafeEqual(presentedDigest, tokenDigest)

    if (!ok) {
      res.setHeader('WWW-Authenticate', 'Bearer')
      res.status(401).json(UNAUTHORIZED)
      return
    }

    next()
  }
}
