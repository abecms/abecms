import express from 'express'
import https from 'https'
import fse from 'fs-extra'
import session from 'express-session'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import exphbs from 'express-secure-handlebars'
import path from 'path'
import busboy from 'connect-busboy'
import clc from 'cli-color'
import openurl from 'openurl'
import uuid from 'uuid'
import flash from 'connect-flash'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import passport from 'passport'

import {
  config,
  coreUtils,
  cmsTemplates,
  printInput,
  abeImport,
  testObj,
  math,
  notEmpty,
  printJson,
  className,
  compileAbe,
  listPage,
  ifIn,
  ifCond,
  moduloIf,
  attrAbe,
  folders,
  printConfig,
  abeExtend,
  Manager
} from '../cli'

import {
  middleWebsite,
  middleLogin,
  middleCheckCsrf,
  middleIsAllowed
} from './middlewares'

var abePort = null

if(config.port) abePort = config.port
if(process.env.PORT) abePort = process.env.PORT

abeExtend.lock.deleteAll() // delete all process .lock when abe start

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

var html = exphbs.create({
  extname: '.' + config.files.templates.extension,
  helpers: {
    abe: compileAbe,
    listPage: listPage,
    math: math,
    printInput: printInput,
    abeImport: abeImport,
    moduloIf: moduloIf,
    testObj: testObj,
    notEmpty: notEmpty,
    printJson: printJson,
    className: className,
    attrAbe: attrAbe,
    folders: folders,
    printConfig: printConfig,
    ifIn: ifIn,
    ifCond: ifCond
  }
})

var opts = {}
if (coreUtils.file.exist(path.join(config.root, 'cert.pem'))) {
  opts = {
    key: fse.readFileSync( path.join(config.root, 'key.pem')),
    cert: fse.readFileSync( path.join(config.root, 'cert.pem'))
  }
}

var app = express(opts)
  
  // Instantiate Singleton Manager (which lists all blog files)
Manager.instance.init()
app.set('config', config.getConfigByWebsite())

app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({
  cookie: {
    secure: config.cookie.secure
  }
}));

app.use(bodyParser.json({limit: '1gb'}))
app.use(bodyParser.urlencoded({limit: '1gb', extended: true, parameterLimit: 10000 }))
app.use(function (req, res, next) {
  res.locals.nonce = uuid.v4()
  next()
})
app.use(function (req, res, next) {
  if(typeof req.query.logs !== 'undefined' && req.query.logs !== null
      && req.query.logs === 'true') {
    config.logs = true
  }else if(typeof req.query.logs !== 'undefined' && req.query.logs !== null
      && req.query.logs === 'false') {
    config.logs = false
  }
  next()
})

if(config.security === true){
  app.use(helmet())
  app.use(helmet.csp({
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\''].concat(config.csp.scriptSrc),
      styleSrc: ['\'self\'', '\'unsafe-inline\''].concat(config.csp.styleSrc),
      imgSrc: ['\'self\'', 'data:'].concat(config.csp.imgSrc),
        // frameSrc: ["'self'"],
      childSrc: ['\'self\''].concat(config.csp.childSrc),
      frameAncestors: ['\'self\''].concat(config.csp.frameAncestors),
      mediaSrc: ['\'self\''].concat(config.csp.mediaSrc),
      fontSrc: ['\'self\''].concat(config.csp.fontSrc),
      connectSrc: ['\'self\''].concat(config.csp.connectSrc),
      sandbox: ['allow-same-origin', 'allow-scripts', 'allow-modals', 'allow-popups', 'allow-forms'],
      reportUri: '/report-violation',
      objectSrc: [], // An empty array allows nothing through
    },
    reportOnly: false, // Set to true if you only want browsers to report errors, not block them
    setAllHeaders: false, // Set to true if you want to blindly set all headers: Content-Security-Policy, X-WebKit-CSP, and X-Content-Security-Policy.
    disableAndroid: false, // Set to true if you want to disable CSP on Android where it can be buggy.    
    browserSniff: true // Set to false if you want to completely disable any user-agent sniffing. This may make the headers less compatible but it will be much faster. This defaults to `true`.
  }))
}

var port = (abePort !== null) ? abePort : 3000
port = abeExtend.hooks.instance.trigger('beforeExpress', port)

app.set('views', path.join(__dirname, '/templates'))
app.engine('.html', html.engine)
app.set('view engine', '.html')

app.locals.layout = false

app.use(middleIsAllowed)
app.use(middleLogin)
app.use(middleWebsite)
app.use(middleCheckCsrf)
app.use(express.static(__dirname + '/public'))

cmsTemplates.assets.copy()

let publish = path.join(config.root, config.publish.url)
app.use(express.static(publish))

if(config.partials !== '') {
  if (coreUtils.file.exist(path.join(config.root, config.partials))) {
    app.use(express.static(path.join(config.root, config.partials)))
  }
}

if(config.custom !== '') {
  if (coreUtils.file.exist(path.join(config.root, config.custom))) {
    app.use(express.static(path.join(config.root, config.custom)))
  }
}

var pluginsPartials = abeExtend.plugins.instance.getPartials()
Array.prototype.forEach.call(pluginsPartials, (pluginPartials) => {
  app.use(express.static(pluginPartials))
})

app.use(express.static(__dirname + '/node_modules/handlebars/dist'))
app.use(busboy({
  limits: {
    fileSize: config.upload.fileSizelimit
  }
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// depending on the way you serve this app, cookie.secure will be set
// in Production, this app has to be reverse-proxified
app.use(session({
  name: 'sessionId',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: config.cookie.secure},
  proxy: true
}))

abeExtend.hooks.instance.trigger('afterExpress', app, express)

if (coreUtils.file.exist(path.join(config.root, 'cert.pem'))) {
  var server = https.createServer(opts, app)
  server.listen(port, function() {
    console.log(clc.green(`\nserver running at https://localhost:${port}/`))
    if(process.env.OPENURL) openurl.open(`https://localhost:${port}/abe/`)
  })
}else {
  app.listen(port, function() {
    console.log(clc.green(`\nserver running at http://localhost:${port}/`))
    if(process.env.OPENURL) openurl.open(`http://localhost:${port}/abe/`)
  })
}

// important : require here so config.root is defined
var controllers = require('./controllers')
app.use(controllers.default)

// This static path is mandatory for relative path to statics in templates
app.use('/abe', express.static(publish))
