/**
 * Server-to-server bearer authentication of the demo gateway.
 */
const chai = require('chai')
const net = require('net')

const {start, call, post, TEST_TOKEN} = require('./helpers')
const {MIN_TOKEN_LENGTH, resolveAuthConfig} = require('../../src/demo/auth')

/** Issue a raw HTTP request so we can send genuinely duplicated header lines. */
function rawRequest(base, lines) {
  const port = Number(new URL(base).port)
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1', () => {
      socket.write(lines.join('\r\n') + '\r\n\r\n')
    })
    let data = ''
    socket.setTimeout(5000, () => {
      socket.destroy()
      reject(new Error('raw request timed out'))
    })
    socket.on('data', (chunk) => {
      data += chunk.toString('utf8')
    })
    socket.on('end', () => resolve(data))
    socket.on('close', () => resolve(data))
    socket.on('error', reject)
  })
}

describe('Demo gateway / authentication', function () {
  this.timeout(10000)

  let gw

  before(async function () {
    gw = await start()
  })

  after(async function () {
    await gw.close()
  })

  describe('startup configuration', function () {
    it('fails closed when no token and no explicit opt-out are given', function () {
      chai
        .expect(() => resolveAuthConfig({}))
        .to.throw(/ABE_DEMO_API_TOKEN is not set/)
      chai
        .expect(() => resolveAuthConfig({ABE_DEMO_API_TOKEN: '   '}))
        .to.throw(/ABE_DEMO_API_TOKEN is not set/)
      chai
        .expect(() =>
          resolveAuthConfig({ABE_DEMO_ALLOW_UNAUTHENTICATED: 'yes'}),
        )
        .to.throw(/ABE_DEMO_API_TOKEN is not set/)
    })

    it('rejects a token shorter than the documented minimum', function () {
      chai
        .expect(() =>
          resolveAuthConfig({
            ABE_DEMO_API_TOKEN: 'x'.repeat(MIN_TOKEN_LENGTH - 1),
          }),
        )
        .to.throw(new RegExp(`at least ${MIN_TOKEN_LENGTH} characters`))
    })

    it('never puts the token in a configuration error message', function () {
      const secret = 'short-but-secret'
      try {
        resolveAuthConfig({ABE_DEMO_API_TOKEN: secret})
        throw new Error('should have thrown')
      } catch (err) {
        chai.expect(err.message).to.not.contain(secret)
      }
    })

    it('accepts the development-only opt-out', function () {
      const config = resolveAuthConfig({
        ABE_DEMO_ALLOW_UNAUTHENTICATED: 'true',
      })
      chai.expect(config.enabled).to.equal(false)
      chai.expect(config.tokenDigest).to.equal(null)
    })

    it('stores a digest, never the token itself', function () {
      const config = resolveAuthConfig({ABE_DEMO_API_TOKEN: TEST_TOKEN})
      chai.expect(config.enabled).to.equal(true)
      chai.expect(config.tokenDigest).to.be.instanceOf(Buffer)
      chai.expect(config.tokenDigest).to.have.lengthOf(32)
      chai
        .expect(config.tokenDigest.toString('utf8'))
        .to.not.contain(TEST_TOKEN)
      chai.expect(config.tokenDigest.toString('hex')).to.not.contain(TEST_TOKEN)
    })
  })

  describe('GET /health', function () {
    it('stays reachable without a credential', async function () {
      const res = await call(gw.base, '/health', {noAuth: true})
      chai.expect(res.status).to.equal(200)
      chai.expect(res.body.status).to.equal('ok')
    })

    it('also works with a valid credential', async function () {
      const res = await call(gw.base, '/health')
      chai.expect(res.status).to.equal(200)
    })

    it('does not leak the token in the probe response', async function () {
      const res = await call(gw.base, '/health')
      chai.expect(res.raw).to.not.contain(TEST_TOKEN)
    })
  })

  describe('protected endpoints', function () {
    it('rejects a request with no Authorization header', async function () {
      for (const res of [
        await call(gw.base, '/schema', {noAuth: true}),
        await post(gw.base, {title: 'nope'}, {noAuth: true}),
      ]) {
        chai.expect(res.status).to.equal(401)
        chai.expect(res.headers.get('www-authenticate')).to.equal('Bearer')
        chai.expect(res.body).to.deep.equal({
          error: 'unauthorized',
          message: 'A valid bearer token is required.',
        })
      }
    })

    it('rejects malformed Authorization headers', async function () {
      const malformed = [
        '',
        'Bearer',
        'Bearer ',
        'Bearer    ',
        TEST_TOKEN,
        `Basic ${TEST_TOKEN}`,
        `Token ${TEST_TOKEN}`,
        `Bearer ${TEST_TOKEN} extra`,
        `Bearer ${TEST_TOKEN}\tx`,
        'Bearer not a token',
        'Bearer ***',
        `bearer_${TEST_TOKEN}`,
      ]

      for (const authorization of malformed) {
        const res = await call(gw.base, '/schema', {
          headers: {authorization},
        })
        chai.expect(res.status, JSON.stringify(authorization)).to.equal(401)
        chai.expect(res.body.error).to.equal('unauthorized')
      }
    })

    it('rejects a wrong token of identical length', async function () {
      const wrong = 'z'.repeat(TEST_TOKEN.length)
      chai.expect(wrong).to.have.lengthOf(TEST_TOKEN.length)

      const res = await call(gw.base, '/schema', {
        headers: {authorization: `Bearer ${wrong}`},
      })
      chai.expect(res.status).to.equal(401)
      chai.expect(res.body.error).to.equal('unauthorized')
    })

    it('rejects a token that is a prefix or suffix of the real one', async function () {
      for (const candidate of [
        TEST_TOKEN.slice(0, -1),
        TEST_TOKEN.slice(1),
        `${TEST_TOKEN}x`,
      ]) {
        const res = await call(gw.base, '/schema', {
          headers: {authorization: `Bearer ${candidate}`},
        })
        chai.expect(res.status).to.equal(401)
      }
    })

    it('rejects duplicated Authorization header lines', async function () {
      const response = await rawRequest(gw.base, [
        'GET /schema HTTP/1.1',
        'Host: 127.0.0.1',
        `Authorization: Bearer ${TEST_TOKEN}`,
        'Authorization: Bearer smuggled',
        'Connection: close',
      ])
      chai.expect(response).to.contain('401')
      chai.expect(response).to.contain('WWW-Authenticate: Bearer')
      chai.expect(response).to.contain('unauthorized')
    })

    it('returns the very same body for every failure mode', async function () {
      const bodies = []
      for (const init of [
        {noAuth: true},
        {headers: {authorization: 'Bearer'}},
        {headers: {authorization: `Basic ${TEST_TOKEN}`}},
        {headers: {authorization: `Bearer ${'z'.repeat(TEST_TOKEN.length)}`}},
      ]) {
        const res = await call(gw.base, '/schema', init)
        bodies.push(JSON.stringify(res.body))
      }
      chai.expect(new Set(bodies).size).to.equal(1)
    })

    it('accepts the correct token on /schema and /render', async function () {
      const schemaRes = await call(gw.base, '/schema')
      chai.expect(schemaRes.status).to.equal(200)
      chai.expect(schemaRes.body.version).to.equal('1.0.0')

      const renderRes = await post(gw.base, {title: 'Authenticated'})
      chai.expect(renderRes.status).to.equal(200)
      chai.expect(renderRes.body.html).to.contain('Authenticated')
    })

    it('accepts a case-insensitive Bearer scheme', async function () {
      for (const scheme of ['bearer', 'BEARER', 'BeArEr']) {
        const res = await call(gw.base, '/schema', {
          headers: {authorization: `${scheme} ${TEST_TOKEN}`},
        })
        chai.expect(res.status, scheme).to.equal(200)
      }
    })

    it('sets Vary: Authorization on protected responses', async function () {
      const res = await call(gw.base, '/schema')
      chai.expect(res.headers.get('vary')).to.contain('Authorization')
    })
  })

  describe('token confidentiality', function () {
    it('never echoes the token in a 401 response', async function () {
      const res = await call(gw.base, '/schema', {
        headers: {authorization: `Bearer ${TEST_TOKEN}x`},
      })
      chai.expect(res.status).to.equal(401)
      chai.expect(res.raw).to.not.contain(TEST_TOKEN)
      for (const [, value] of res.headers) {
        chai.expect(value).to.not.contain(TEST_TOKEN)
      }
    })

    it('never echoes the token in a successful response', async function () {
      const res = await post(gw.base, {title: 'No leak', ctaLabel: 'Go'})
      chai.expect(res.status).to.equal(200)
      chai.expect(res.raw).to.not.contain(TEST_TOKEN)
      for (const [, value] of res.headers) {
        chai.expect(value).to.not.contain(TEST_TOKEN)
      }
    })

    it('never echoes the token in a validation error response', async function () {
      const res = await post(gw.base, {title: 'x', authorization: TEST_TOKEN})
      chai.expect(res.status).to.equal(400)
      chai.expect(res.body.error).to.equal('unknown_field')
      chai.expect(res.raw).to.not.contain(TEST_TOKEN)
    })
  })

  describe('route surface under authentication', function () {
    const forbidden = [
      '/abe',
      '/abe/users',
      '/abe/build-template',
      '/abe/page/demo.html',
      '/abe/operations/publish',
      '/abe/plugins',
      '/site/index.html',
      '/data/posts/index.json',
      '/login',
    ]

    it('keeps unknown and back-office routes at 404 with a valid token', async function () {
      for (const path of forbidden) {
        const res = await call(gw.base, path)
        chai.expect(res.status, path).to.equal(404)
        chai.expect(res.body.error).to.equal('not_found')
      }
    })

    it('keeps unknown and back-office routes at 404 without a token', async function () {
      for (const path of forbidden) {
        const res = await call(gw.base, path, {noAuth: true})
        chai.expect(res.status, path).to.equal(404)
        chai.expect(res.body.error).to.equal('not_found')
      }
    })

    it('answers 405 before authentication on published routes', async function () {
      const res = await call(gw.base, '/render', {method: 'GET', noAuth: true})
      chai.expect(res.status).to.equal(405)
    })
  })
})

describe('Demo gateway / development-only opt-out', function () {
  this.timeout(10000)

  let gw

  before(async function () {
    gw = await start({
      auth: resolveAuthConfig({ABE_DEMO_ALLOW_UNAUTHENTICATED: 'true'}),
    })
  })

  after(async function () {
    await gw.close()
  })

  it('serves the protected endpoints without a credential', async function () {
    const schemaRes = await call(gw.base, '/schema', {noAuth: true})
    chai.expect(schemaRes.status).to.equal(200)

    const renderRes = await post(gw.base, {title: 'Dev mode'}, {noAuth: true})
    chai.expect(renderRes.status).to.equal(200)
  })

  it('still hides the back office', async function () {
    const res = await call(gw.base, '/abe/users', {noAuth: true})
    chai.expect(res.status).to.equal(404)
  })
})

describe('Demo gateway / unauthenticated requests consume the rate limit', function () {
  this.timeout(10000)

  let gw

  before(async function () {
    gw = await start({rateLimitMax: 3, rateLimitWindowMs: 60000})
  })

  after(async function () {
    await gw.close()
  })

  it('throttles anonymous callers before they can retry forever', async function () {
    // Rate limiting runs before authentication on purpose: three anonymous
    // 401s exhaust the window, and the fourth request is rejected with 429
    // even though it carries a valid token.
    const anonymous = []
    for (let i = 0; i < 3; i++) {
      const res = await call(gw.base, '/schema', {noAuth: true})
      anonymous.push(res.status)
    }
    chai.expect(anonymous).to.deep.equal([401, 401, 401])

    const authenticated = await call(gw.base, '/schema')
    chai.expect(authenticated.status).to.equal(429)
    chai.expect(authenticated.body.error).to.equal('rate_limited')
  })
})
