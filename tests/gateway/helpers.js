const {createApp} = require('../../src/demo/app')
const {resolveAuthConfig} = require('../../src/demo/auth')

/**
 * Fixture token. Not a real secret: it only ever exists in this test suite and
 * is regenerated per environment in production.
 */
const TEST_TOKEN = 'a'.repeat(16) + 'b'.repeat(16) + 'c'.repeat(32)

const TEST_AUTH = resolveAuthConfig({ABE_DEMO_API_TOKEN: TEST_TOKEN})

/**
 * Start the gateway on an ephemeral loopback port.
 *
 * Authentication is explicitly enabled with the fixture token by default; pass
 * `auth: resolveAuthConfig({ABE_DEMO_ALLOW_UNAUTHENTICATED: 'true'})` to test
 * the development opt-out.
 */
function start(options) {
  const app = createApp(
    Object.assign({rateLimitMax: 10000, auth: TEST_AUTH}, options),
  )
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const {port} = server.address()
      resolve({
        server,
        base: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done)),
      })
    })
  })
}

function authHeaders(extra) {
  return Object.assign({authorization: `Bearer ${TEST_TOKEN}`}, extra)
}

/**
 * Perform a request. The fixture bearer token is attached by default; pass
 * `{noAuth: true}` to omit it, or an explicit `authorization` header to
 * override it.
 */
async function call(base, path, init = {}) {
  const {noAuth, headers, ...rest} = init
  const finalHeaders = noAuth
    ? Object.assign({}, headers)
    : authHeaders(headers)

  const res = await fetch(
    `${base}${path}`,
    Object.assign({headers: finalHeaders}, rest),
  )
  const text = await res.text()
  let body = null
  try {
    body = JSON.parse(text)
  } catch (e) {
    body = text
  }
  return {status: res.status, headers: res.headers, body, raw: text}
}

function post(base, payload, extra = {}) {
  const {headers, ...rest} = extra
  return call(
    base,
    '/render',
    Object.assign(
      {
        method: 'POST',
        headers: Object.assign({'content-type': 'application/json'}, headers),
        body: typeof payload === 'string' ? payload : JSON.stringify(payload),
      },
      rest,
    ),
  )
}

module.exports = {start, call, post, TEST_TOKEN, TEST_AUTH}
