function getLocale(options) {
  return options?.data?.intl?.locales || 'en-US'
}

function parseDate(value) {
  if (value instanceof Date) return value
  return new Date(value)
}

export function registerIntlHelpers(Handlebars) {
  Handlebars.registerHelper('formatDate', function (value, options) {
    if (value == null) return ''
    const locale = getLocale(options)
    return new Intl.DateTimeFormat(locale, options.hash).format(parseDate(value))
  })

  Handlebars.registerHelper('formatTime', function (value, options) {
    if (value == null) return ''
    const locale = getLocale(options)
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      ...options.hash,
    }).format(parseDate(value))
  })

  Handlebars.registerHelper('formatNumber', function (value, options) {
    if (value == null || value === '') return ''
    const locale = getLocale(options)
    return new Intl.NumberFormat(locale, options.hash).format(Number(value))
  })

  Handlebars.registerHelper('formatRelative', function (value, options) {
    if (value == null) return ''
    const locale = getLocale(options)
    const date = parseDate(value)
    const now = Date.now()
    const diffMs = date.getTime() - now
    const diffSec = Math.round(diffMs / 1000)
    const units = [
      ['year', 60 * 60 * 24 * 365],
      ['month', 60 * 60 * 24 * 30],
      ['day', 60 * 60 * 24],
      ['hour', 60 * 60],
      ['minute', 60],
      ['second', 1],
    ]

    for (const [unit, secondsInUnit] of units) {
      const delta = Math.round(diffSec / secondsInUnit)
      if (Math.abs(delta) >= 1) {
        const rtf = new Intl.RelativeTimeFormat(locale, {numeric: 'auto'})
        return rtf.format(delta, unit)
      }
    }

    return new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}).format(0, 'second')
  })
}
