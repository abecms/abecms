/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Deliberately dependency free and process local: the demo gateway is a single
 * small container with no datastore and must not require outbound network.
 */
export function createRateLimiter({windowMs, max, maxClients = 10000}) {
  const hits = new Map()

  function prune(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key)
    }
    if (hits.size > maxClients) hits.clear()
  }

  return function rateLimit(req, res, next) {
    const now = Date.now()
    prune(now)

    const key = req.ip || req.socket.remoteAddress || 'unknown'
    let entry = hits.get(key)

    if (!entry || entry.resetAt <= now) {
      entry = {count: 0, resetAt: now + windowMs}
      hits.set(key, entry)
    }

    entry.count += 1

    const remaining = Math.max(0, max - entry.count)
    res.setHeader('RateLimit-Limit', String(max))
    res.setHeader('RateLimit-Remaining', String(remaining))
    res.setHeader(
      'RateLimit-Reset',
      String(Math.ceil((entry.resetAt - now) / 1000)),
    )

    if (entry.count > max) {
      res.setHeader(
        'Retry-After',
        String(Math.ceil((entry.resetAt - now) / 1000)),
      )
      res
        .status(429)
        .json({error: 'rate_limited', message: 'Too many requests.'})
      return
    }

    next()
  }
}
