import express from 'express'
import https from 'https'
import fs from 'fs'
import session from 'express-session'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import exphbs from 'express-handlebars'
import path from 'path'
import busboy from 'connect-busboy'
import clc from 'cli-color'
import openurl from 'openurl'
import flash from 'connect-flash'
import cookieParser from 'cookie-parser'
import csrf from 'csurf'
import passport from 'passport'
import layouts from 'handlebars-layouts'
import { check, validationResult } from 'express-validator'

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
  isAuthorized,
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
  middleIsAuthorized,
  middleLiveReload
} from './middlewares'

//import getHome from './routes/get-home'
import getHome from './routes/get-main'

require('events').EventEmitter.defaultMaxListeners = 100

var abePort = null

if (config.port) abePort = config.port
if (process.env.PORT) abePort = process.env.PORT

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

var partialsDir = [
  path.join(__dirname, 'views/partials/'),
  path.join(config.root, config.custom)
]
var pluginsPartialsDir = abeExtend.plugins.instance.getPartials()
Array.prototype.forEach.call(pluginsPartialsDir, pluginPartialsDir => {
  partialsDir.push(pluginPartialsDir)
})

var html = exphbs.create({
  extname: `.${config.files.templates.extension}`,
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
    ifCond: ifCond,
    isAuthorized: isAuthorized
  },
  partialsDir: partialsDir
})

var handlebars = html.handlebars;

// I register the layout plugin
handlebars.registerHelper(layouts(handlebars));

// I load the partials in Handlebars for the layout plugin
var partials = path.join(__dirname, 'views/partials/');
partialsDir.forEach(function(pathDir) {
  fs.readdirSync(partials).forEach(function (file) {
    var source = fs.readFileSync(partials + file, "utf8")
    var partial = /(.+)\.html/.exec(file).pop();

    handlebars.registerPartial(partial, source);
  });
})

var opts = {}
if (coreUtils.file.exist(path.join(config.root, 'cert.pem'))) {
  opts = {
    key: fs.readFileSync(path.join(config.root, 'key.pem')),
    cert: fs.readFileSync(path.join(config.root, 'cert.pem'))
  }
}

var app = express(opts)
var server

// Instantiate Singleton Manager (which lists all blog files)
Manager.instance.init()
app.set('config', config.getConfigByWebsite())

app.use(flash())
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
app.use(
  bodyParser.urlencoded({limit: '1gb', extended: true, parameterLimit: 50000})
)
//app.use(expressValidator())
app.use(csrf({cookie: {secure: config.cookie.secure}}))
app.use(function(req, res, next) {
  if (req.url.indexOf('/abe/') > -1) {
    res.locals._csrf = req.csrfToken()
  }
  next()
})

app.use(bodyParser.json({limit: '1gb'}))

if (config.security === true) {
  app.use(helmet())
  app.use(
    helmet.csp({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"].concat(config.csp.scriptSrc),
        styleSrc: ["'self'", "'unsafe-inline'"].concat(config.csp.styleSrc),
        imgSrc: ["'self'", 'data:'].concat(config.csp.imgSrc),
        // frameSrc: ["'self'"],
        childSrc: ["'self'"].concat(config.csp.childSrc),
        frameAncestors: ["'self'"].concat(config.csp.frameAncestors),
        mediaSrc: ["'self'"].concat(config.csp.mediaSrc),
        fontSrc: ["'self'"].concat(config.csp.fontSrc),
        connectSrc: ["'self'"].concat(config.csp.connectSrc),
        sandbox: [
          'allow-same-origin',
          'allow-scripts',
          'allow-modals',
          'allow-popups',
          'allow-forms'
        ],
        reportUri: '/report-violation',
        objectSrc: [] // An empty array allows nothing through
      },
      reportOnly: false, // Set to true if you only want browsers to report errors, not block them
      setAllHeaders: false, // Set to true if you want to blindly set all headers: Content-Security-Policy, X-WebKit-CSP, and X-Content-Security-Policy.
      disableAndroid: false, // Set to true if you want to disable CSP on Android where it can be buggy.
      browserSniff: true // Set to false if you want to completely disable any user-agent sniffing. This may make the headers less compatible but it will be much faster. This defaults to `true`.
    })
  )
}

var port = abePort !== null ? abePort : 3000
port = abeExtend.hooks.instance.trigger('beforeExpress', port)

app.set('views', path.join(__dirname, '/views'))
app.engine('.html', html.engine)
app.set('view engine', '.html')

app.locals.layout = false

app.use(middleCheckCsrf)
app.use(middleIsAuthorized)
app.use(middleLogin)
app.use(middleWebsite)
if (process.env.NODE_ENV === 'development') {
  Manager.instance.initDev()
  process.on('uncaughtException', function(err) {
    // We need to trap this error which is sent on websocket client connection
    if (err.code !== 'ECONNRESET') {
      throw err
    }
  })
  app.use(middleLiveReload)
}

app.use(express.static(__dirname + '/public'))

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Access-Token, X-Requested-With, Content-Type, Accept'
  )
  next()
})

let publish = Manager.instance.pathPublish
app.use(express.static(publish))

if (coreUtils.file.exist(Manager.instance.pathPartials)) {
  app.use(express.static(Manager.instance.pathPartials))
}

if (config.custom !== '') {
  if (coreUtils.file.exist(path.join(config.root, config.custom))) {
    app.use(express.static(path.join(config.root, config.custom)))
  }
}

var pluginsPartials = abeExtend.plugins.instance.getPartials()
Array.prototype.forEach.call(pluginsPartials, pluginPartials => {
  app.use(express.static(pluginPartials))
})

app.use(express.static(__dirname + '/node_modules/handlebars/dist'))
app.use(
  busboy({
    limits: {
      fileSize: config.upload.fileSizelimit
    }
  })
)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// depending on the way you serve this app, cookie.secure will be set
// in Production, this app has to be reverse-proxified
app.use(
  session({
    name: 'sessionId',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: config.cookie.secure},
    proxy: true
  })
)

abeExtend.hooks.instance.trigger('afterExpress', app, express)

// if served through pm2 with sockets
if (fs.existsSync(port) && fs.lstatSync(port).isSocket()) {
  fs.unlink(port)
}

if (coreUtils.file.exist(path.join(config.root, 'cert.pem'))) {
  server = https.createServer(opts, app)
  server.listen(port, function() {
    console.log(clc.green(`\nserver running at https://localhost:${port}/`))
    if (process.env.OPENURL) openurl.open(`https://localhost:${port}/abe/`)
  })
} else {
  server = app.listen(port, function() {
    console.log(clc.green(`\nserver running at http://localhost:${port}/`))
    if (process.env.OPENURL) openurl.open(`http://localhost:${port}/abe/`)
  })
}

if (config.websocket.active === true) {
  const io = require('socket.io')(server);
  app.use(function(request, response, next) {
    request.io = io;
    next();
  });
}

server.on('error', onError)

function onError(error) {
  if (error.syscall !== 'listen') throw error

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

var cleanup = function() {
  server.close(function() {
    console.log('Closed out remaining connections.')
    process.exit()
  })

  setTimeout(function() {
    console.log('Could not close connections in time, forcing shut down')
    process.exit(1)
  }, 10 * 1000)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// important : require here so config.root is defined
var routes = require('./routes')
app.use(routes.default)

// This static path is mandatory for relative path to statics in templates
app.use('/abe/editor', express.static(publish))
app.use('/abe/page', express.static(publish))
app.get('/abe*', getHome)
