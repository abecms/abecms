import {createApp, DEFAULTS} from './app'
import {engine} from './renderer'

function intFromEnv(name, fallback) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function startServer() {
  const port = intFromEnv('ABE_DEMO_PORT', 8080)
  const host = process.env.ABE_DEMO_HOST || '0.0.0.0'

  const app = createApp({
    rateLimitWindowMs: intFromEnv(
      'ABE_DEMO_RATE_WINDOW_MS',
      DEFAULTS.rateLimitWindowMs,
    ),
    rateLimitMax: intFromEnv('ABE_DEMO_RATE_MAX', DEFAULTS.rateLimitMax),
    requestTimeoutMs: intFromEnv(
      'ABE_DEMO_TIMEOUT_MS',
      DEFAULTS.requestTimeoutMs,
    ),
    trustProxy: process.env.ABE_DEMO_TRUST_PROXY === 'true',
  })

  const server = app.listen(port, host, () => {
    console.log(
      `[abe-demo] listening on ${host}:${port} (engine ${engine.name}@${engine.version} via ${engine.renderer})`,
    )
  })

  server.headersTimeout = 10000
  server.requestTimeout = 10000
  server.keepAliveTimeout = 5000

  const shutdown = (signal) => () => {
    console.log(`[abe-demo] ${signal} received, closing`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 5000).unref()
  }

  process.on('SIGTERM', shutdown('SIGTERM'))
  process.on('SIGINT', shutdown('SIGINT'))

  return server
}

if (require.main === module) {
  startServer()
}
