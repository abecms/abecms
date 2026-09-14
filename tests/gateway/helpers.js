const {createApp} = require('../../src/demo/app')

/** Start the gateway on an ephemeral loopback port. */
function start(options) {
  const app = createApp(Object.assign({rateLimitMax: 10000}, options))
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

async function call(base, path, init) {
  const res = await fetch(`${base}${path}`, init)
  const text = await res.text()
  let body = null
  try {
    body = JSON.parse(text)
  } catch (e) {
    body = text
  }
  return {status: res.status, headers: res.headers, body}
}

function post(base, payload, extra) {
  return call(
    base,
    '/render',
    Object.assign(
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: typeof payload === 'string' ? payload : JSON.stringify(payload),
      },
      extra,
    ),
  )
}

module.exports = {start, call, post}
