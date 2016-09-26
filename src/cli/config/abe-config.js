var config = {
  root: '',
  localeFolder: 'locale',
  intlData: {
    locales: 'en-US'
  },
  plugins: {
    url:'plugins'
  },
  templates: {
    url: 'templates'
  },
  structure: {
    url: 'structure'
  },
  upload: {
    image: 'image',
    fileSizelimit: 10485760
  },
  data: {
    url: 'data'
  },
  draft: {
    url: 'draft'
  },
  publish: {
    url: 'site'
  },
  reference: {
    url: 'reference'
  },
  csp: {
    scriptSrc: [],
    styleSrc: [],
    imgSrc: [],
    childSrc: [],
    frameAncestors: [],
    mediaSrc: [],
    fontSrc: [],
    connectSrc: []
  },
  security: true,
  htmlWhiteList: {
    'blockquote': ['style'],
    'span': ['style'],
    'font': ['style', 'color'],
    'div': ['style'],
    'sup': ['style'],
    'sub': ['style'],
    'ul': ['style'],
    'li': ['style'],
    'p': ['style'],
    'b': ['style'],
    'strong': ['style'],
    'i': ['style'],
    'u': ['style'],
    'a': ['style', 'href'],
    'br': [],
    'h1': ['style'],
    'h2': ['style'],
    'h3': ['style'],
    'h4': ['style'],
    'pre': ['style'],
    'code': ['style']
  },
  files: {
    exclude: /^[.]/,
    templates: {
      extension: 'html',
      assets: '_files',
      check: /\.hbs|\.shtml|\.html|\.htm/,
      precompile: false
    }
  },
  log: {
    active: false,
    path: 'abe-logs',
    allowed: /(.*?)/
  },
  meta: {
    name: 'abe_meta'
  },
  source: {
    name: 'abe_source'
  },
  hooks: {
    url: 'hooks'
  },
  cookie: {
    secure: false
  },
  sessionSecret: 'ThIsIsAbE',
  abeEngine: '../views/template-engine',
  defaultPartials: '../../../server/views/partials',
  pluginsPartials: 'partials',
  partials: 'templates/partials',
  custom: 'custom',
  siteUrl: false,
  sitePort: false,
  redis: {
    enable: false,
    port: '6379',
    host:'127.0.0.1'
  }
}

export default config
