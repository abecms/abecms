import express from 'express'
import https from 'https'
import fse from 'fs-extra'
import session from 'express-session'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import exphbs from 'express-secure-handlebars'
import path from 'path'
import busboy from 'connect-busboy'
import portfinder from 'portfinder'
import clc from 'cli-color'
import openurl from 'openurl'
import uuid from 'node-uuid'

import {
  config,
  FileParser,
  fileUtils,
  printInput,
  abeImport,
  testObj,
  math,
  notEmpty,
  printJson,
  className,
  abe,
  compileAbe,
  listPage,
  ifIn,
  ifCond,
  moduloIf,
  attrAbe,
  folders,
  Plugins,
  printConfig,
  Hooks
} from '../cli'

var abePort = null

if(process.env.ROOT) config.set({root: process.env.ROOT.replace(/\/$/, '') + '/'})
if(process.env.PORT) abePort = process.env.PORT
config.set({webport: process.env.WEBPORT ? process.env.WEBPORT : 8081})

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

portfinder.getPort(function (err, freePort) {
  var opts = {}
  if (fileUtils.isFile(fileUtils.concatPath(config.root, 'cert.pem'))) {
    opts = {
      key: fse.readFileSync( fileUtils.concatPath(config.root, 'key.pem')),
      cert: fse.readFileSync( fileUtils.concatPath(config.root, 'cert.pem'))
    }
  }

  var app = express(opts)

  app.use(function (req, res, next) {
    res.locals.nonce = uuid.v4()
    next()
  })

  if(config.security === true){
    console.log("msg")
    app.use(helmet())
    app.use(helmet.csp({
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
        sandbox: ['allow-same-origin', 'allow-scripts', "allow-modals", 'allow-popups', 'allow-forms'],
        reportUri: '/report-violation',
        objectSrc: [], // An empty array allows nothing through
      },
      reportOnly: false, // Set to true if you only want browsers to report errors, not block them
      setAllHeaders: false, // Set to true if you want to blindly set all headers: Content-Security-Policy, X-WebKit-CSP, and X-Content-Security-Policy.
      disableAndroid: false, // Set to true if you want to disable CSP on Android where it can be buggy.    
      browserSniff: true // Set to false if you want to completely disable any user-agent sniffing. This may make the headers less compatible but it will be much faster. This defaults to `true`.
    }))

  }

  var port = (abePort !== null) ? abePort : (freePort || 3000)
  port = Hooks.instance.trigger('beforeExpress', port)

  app.set('views', path.join(__dirname, '/templates'))
  app.engine('.html', html.engine)
  app.set('view engine', '.html')

  app.locals.layout = false;

  app.use(express.static(__dirname + '/public'))
  FileParser.copySiteAssets()

  var sites = FileParser.getFolders(config.root.replace(/\/$/, ""), false, 0)
  
  let publish = fileUtils.concatPath(config.root, config.publish.url)
  app.use(express.static(publish))

  if(config.partials !== '') {
    if (fileUtils.isFile(fileUtils.concatPath(config.root, config.partials))) {
      app.use(express.static(fileUtils.concatPath(config.root, config.partials)))
    }
  }

  var pluginsPartials = Plugins.instance.getPartials()
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

  Hooks.instance.trigger('afterExpress', app, express)

  if (fileUtils.isFile(fileUtils.concatPath(config.root, 'cert.pem'))) {
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
})
