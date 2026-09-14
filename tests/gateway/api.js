const chai = require('chai')

const {start, call, post} = require('./helpers')
const {MAX_PAYLOAD_BYTES} = require('../../src/demo/schema')

describe('Demo gateway / HTTP API', function () {
  this.timeout(10000)

  let gw

  before(async function () {
    gw = await start()
  })

  after(async function () {
    await gw.close()
  })

  describe('GET /health', function () {
    it('answers ok with the engine identity', async function () {
      const res = await call(gw.base, '/health')
      chai.expect(res.status).to.equal(200)
      chai.expect(res.body.status).to.equal('ok')
      chai.expect(res.body.engine.name).to.equal('abecms')
      chai.expect(res.body.engine.renderer).to.equal('abecms.Page')
    })
  })

  describe('GET /schema', function () {
    it('returns the frozen demo content schema', async function () {
      const res = await call(gw.base, '/schema')
      chai.expect(res.status).to.equal(200)
      chai.expect(res.body.version).to.equal('1.0.0')
      chai.expect(res.body.maxPayloadBytes).to.equal(MAX_PAYLOAD_BYTES)
      chai
        .expect(res.body.fields.map((f) => f.name))
        .to.deep.equal(['title', 'introduction', 'ctaLabel', 'status'])
      const status = res.body.fields.find((f) => f.name === 'status')
      chai.expect(status.values).to.deep.equal(['draft', 'published'])
    })
  })

  describe('POST /render', function () {
    it('renders a valid document', async function () {
      const res = await post(gw.base, {
        title: 'Living Color',
        introduction: 'A demo of the real ABECMS renderer.',
        ctaLabel: 'Discover',
        status: 'published',
      })

      chai.expect(res.status).to.equal(200)
      chai
        .expect(res.body.html)
        .to.contain('<h1 class="abe-demo__title">Living Color</h1>')
      chai
        .expect(res.body.html)
        .to.contain('A demo of the real ABECMS renderer.')
      chai.expect(res.body.html).to.contain('Discover')
      chai.expect(res.body.html).to.contain('abe-demo--published')
      chai.expect(res.body.content).to.deep.equal({
        title: 'Living Color',
        introduction: 'A demo of the real ABECMS renderer.',
        ctaLabel: 'Discover',
        status: 'published',
      })
      chai.expect(res.body.engine.name).to.equal('abecms')
    })

    it('defaults optional fields and status to draft', async function () {
      const res = await post(gw.base, {title: 'Only a title'})
      chai.expect(res.status).to.equal(200)
      chai.expect(res.body.content.status).to.equal('draft')
      chai.expect(res.body.content.introduction).to.equal('')
    })

    it('escapes HTML coming from user text', async function () {
      const res = await post(gw.base, {
        title: '<script>alert(1)</script>',
        introduction: '<img src=x onerror=alert(2)> & "quoted"',
        ctaLabel: '</a><svg onload=alert(3)>',
      })

      chai.expect(res.status).to.equal(200)
      chai.expect(res.body.html).to.not.contain('<script>')
      chai.expect(res.body.html).to.not.contain('onerror=')
      chai.expect(res.body.html).to.not.contain('<svg')
      chai.expect(res.body.html).to.contain('&lt;script&gt;')
      chai.expect(res.body.html).to.contain('&amp;')
    })

    it('does not let user text inject Abe tags or Handlebars expressions', async function () {
      const res = await post(gw.base, {
        title: "{{abe type='text' key='secret'}}",
        introduction: '{{config.sessionSecret}}',
      })
      chai.expect(res.status).to.equal(200)
      chai.expect(res.body.html).to.contain('{{abe')
      chai.expect(res.body.html).to.not.contain('ThIsIsAbE')
    })

    it('rejects extra fields', async function () {
      const res = await post(gw.base, {title: 'ok', template: 'article'})
      chai.expect(res.status).to.equal(400)
      chai.expect(res.body.error).to.equal('unknown_field')
      chai.expect(res.body.field).to.equal('template')
    })

    it('rejects a missing title', async function () {
      const res = await post(gw.base, {introduction: 'no title'})
      chai.expect(res.status).to.equal(400)
      chai.expect(res.body.error).to.equal('missing_field')
    })

    it('rejects non-string field types', async function () {
      for (const payload of [
        {title: 42},
        {title: 'ok', introduction: {a: 1}},
        {title: 'ok', ctaLabel: ['x']},
        {title: 'ok', status: true},
      ]) {
        const res = await post(gw.base, payload)
        chai.expect(res.status, JSON.stringify(payload)).to.equal(400)
        chai.expect(res.body.error).to.equal('invalid_type')
      }
    })

    it('rejects a status outside the enum', async function () {
      const res = await post(gw.base, {title: 'ok', status: 'archived'})
      chai.expect(res.status).to.equal(400)
      chai.expect(res.body.error).to.equal('invalid_value')
    })

    it('rejects over-long fields', async function () {
      const res = await post(gw.base, {title: 'x'.repeat(121)})
      chai.expect(res.status).to.equal(400)
      chai.expect(res.body.error).to.equal('too_long')
    })

    it('rejects an oversized payload', async function () {
      const res = await post(gw.base, {
        title: 'ok',
        introduction: 'y'.repeat(MAX_PAYLOAD_BYTES + 2048),
      })
      chai.expect(res.status).to.equal(413)
      chai.expect(res.body.error).to.equal('payload_too_large')
    })

    it('rejects a non-object body', async function () {
      const res = await post(gw.base, '["title"]')
      chai.expect(res.status).to.equal(400)
      chai.expect(res.body.error).to.equal('invalid_body')
    })

    it('rejects malformed JSON', async function () {
      const res = await post(gw.base, '{"title":')
      chai.expect(res.status).to.equal(400)
      chai.expect(res.body.error).to.equal('invalid_json')
    })

    it('rejects non-JSON content types', async function () {
      const res = await post(gw.base, 'title=ok', {
        headers: {'content-type': 'application/x-www-form-urlencoded'},
      })
      chai.expect(res.status).to.equal(415)
      chai.expect(res.body.error).to.equal('unsupported_media_type')
    })
  })

  describe('routes and methods allowlist', function () {
    it('answers 405 on a non-allowed method of a published route', async function () {
      for (const [path, method] of [
        ['/health', 'POST'],
        ['/schema', 'DELETE'],
        ['/render', 'GET'],
        ['/render', 'PUT'],
      ]) {
        const res = await call(gw.base, path, {method})
        chai.expect(res.status, `${method} ${path}`).to.equal(405)
      }
    })

    it('never exposes an ABECMS back-office or filesystem route', async function () {
      const forbidden = [
        '/abe',
        '/abe/',
        '/abe/users',
        '/abe/build-template',
        '/abe/page/demo.html',
        '/abe/editor',
        '/abe/operations/publish',
        '/abe/plugins',
        '/abe/sources',
        '/abe/api/templates',
        '/abecms/scripts/abe.js',
        '/site/index.html',
        '/data/posts/index.json',
        '/../../package.json',
        '/%2e%2e/abe.json',
        '/login',
        '/logout',
      ]

      for (const path of forbidden) {
        for (const method of ['GET', 'POST']) {
          const res = await call(gw.base, path, {method})
          chai.expect(res.status, `${method} ${path}`).to.be.oneOf([400, 404])
          if (res.status === 404) {
            chai.expect(res.body.error).to.equal('not_found')
          }
        }
      }
    })
  })

  describe('security headers', function () {
    it('sets hardening headers and no CORS wildcard', async function () {
      const res = await call(gw.base, '/health')
      chai.expect(res.headers.get('x-powered-by')).to.equal(null)
      chai.expect(res.headers.get('access-control-allow-origin')).to.equal(null)
      chai.expect(res.headers.get('x-content-type-options')).to.equal('nosniff')
      chai
        .expect(res.headers.get('content-security-policy'))
        .to.contain("default-src 'none'")
      chai.expect(res.headers.get('cache-control')).to.equal('no-store')
      chai.expect(res.headers.get('referrer-policy')).to.equal('no-referrer')
    })
  })
})

describe('Demo gateway / rate limit', function () {
  this.timeout(10000)

  let gw

  before(async function () {
    gw = await start({rateLimitMax: 3, rateLimitWindowMs: 60000})
  })

  after(async function () {
    await gw.close()
  })

  it('answers 429 once the window budget is spent', async function () {
    const statuses = []
    for (let i = 0; i < 5; i++) {
      const res = await call(gw.base, '/health')
      statuses.push(res.status)
    }
    chai.expect(statuses.slice(0, 3)).to.deep.equal([200, 200, 200])
    chai.expect(statuses.slice(3)).to.deep.equal([429, 429])

    const last = await call(gw.base, '/health')
    chai.expect(last.body.error).to.equal('rate_limited')
    chai.expect(last.headers.get('retry-after')).to.not.equal(null)
  })
})
