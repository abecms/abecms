'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSecureHandlebars = require('express-secure-handlebars');

var _expressSecureHandlebars2 = _interopRequireDefault(_expressSecureHandlebars);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _connectBusboy = require('connect-busboy');

var _connectBusboy2 = _interopRequireDefault(_connectBusboy);

var _portfinder = require('portfinder');

var _portfinder2 = _interopRequireDefault(_portfinder);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _openurl = require('openurl');

var _openurl2 = _interopRequireDefault(_openurl);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _cli = require('../cli');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var abePort = null;

if (process.env.ROOT) _cli.config.set({ root: process.env.ROOT.replace(/\/$/, '') + '/' });
if (process.env.PORT) abePort = process.env.PORT;
_cli.config.set({ webport: process.env.WEBPORT ? process.env.WEBPORT : 8081 });

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var html = _expressSecureHandlebars2.default.create({
  extname: '.' + _cli.config.files.templates.extension,
  helpers: {
    abe: _cli.compileAbe,
    listPage: _cli.listPage,
    math: _cli.math,
    printInput: _cli.printInput,
    abeImport: _cli.abeImport,
    moduloIf: _cli.moduloIf,
    testObj: _cli.testObj,
    notEmpty: _cli.notEmpty,
    printJson: _cli.printJson,
    className: _cli.className,
    attrAbe: _cli.attrAbe,
    folders: _cli.folders,
    printConfig: _cli.printConfig,
    ifIn: _cli.ifIn,
    ifCond: _cli.ifCond
  }
});

_portfinder2.default.getPort(function (err, freePort) {
  var opts = {};
  if (_cli.fileUtils.isFile(_cli.fileUtils.concatPath(_cli.config.root, 'cert.pem'))) {
    opts = {
      key: _fsExtra2.default.readFileSync(_cli.fileUtils.concatPath(_cli.config.root, 'key.pem')),
      cert: _fsExtra2.default.readFileSync(_cli.fileUtils.concatPath(_cli.config.root, 'cert.pem'))
    };
  }

  var app = (0, _express2.default)(opts);

  app.use(_bodyParser2.default.json({ limit: '1gb' }));
  app.use(_bodyParser2.default.urlencoded({ limit: '1gb', extended: true, parameterLimit: 10000 }));

  app.use(function (req, res, next) {
    res.locals.nonce = _nodeUuid2.default.v4();
    next();
  });

  if (_cli.config.security === true) {
    app.use((0, _helmet2.default)());
    app.use(_helmet2.default.csp({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"].concat(_cli.config.csp.scriptSrc),
        styleSrc: ["'self'", "'unsafe-inline'"].concat(_cli.config.csp.styleSrc),
        imgSrc: ["'self'", 'data:'].concat(_cli.config.csp.imgSrc),
        // frameSrc: ["'self'"],
        childSrc: ["'self'"].concat(_cli.config.csp.childSrc),
        frameAncestors: ["'self'"].concat(_cli.config.csp.frameAncestors),
        mediaSrc: ["'self'"].concat(_cli.config.csp.mediaSrc),
        fontSrc: ["'self'"].concat(_cli.config.csp.fontSrc),
        connectSrc: ["'self'"].concat(_cli.config.csp.connectSrc),
        sandbox: ['allow-same-origin', 'allow-scripts', "allow-modals", 'allow-popups', 'allow-forms'],
        reportUri: '/report-violation',
        objectSrc: [] },
      // An empty array allows nothing through
      reportOnly: false, // Set to true if you only want browsers to report errors, not block them
      setAllHeaders: false, // Set to true if you want to blindly set all headers: Content-Security-Policy, X-WebKit-CSP, and X-Content-Security-Policy.
      disableAndroid: false, // Set to true if you want to disable CSP on Android where it can be buggy.   
      browserSniff: true // Set to false if you want to completely disable any user-agent sniffing. This may make the headers less compatible but it will be much faster. This defaults to `true`.
    }));
  }

  var port = abePort !== null ? abePort : freePort || 3000;
  port = _cli.Hooks.instance.trigger('beforeExpress', port);

  app.set('views', _path2.default.join(__dirname, '/templates'));
  app.engine('.html', html.engine);
  app.set('view engine', '.html');

  app.locals.layout = false;

  app.use(_express2.default.static(__dirname + '/public'));
  _cli.FileParser.copySiteAssets();

  var sites = _cli.FileParser.getFolders(_cli.config.root.replace(/\/$/, ""), false, 0);

  var publish = _cli.fileUtils.concatPath(_cli.config.root, _cli.config.publish.url);
  app.use(_express2.default.static(publish));

  if (_cli.config.partials !== '') {
    if (_cli.fileUtils.isFile(_cli.fileUtils.concatPath(_cli.config.root, _cli.config.partials))) {
      app.use(_express2.default.static(_cli.fileUtils.concatPath(_cli.config.root, _cli.config.partials)));
    }
  }

  if (_cli.config.custom !== '') {
    if (_cli.fileUtils.isFile(_cli.fileUtils.concatPath(_cli.config.root, _cli.config.custom))) {
      app.use(_express2.default.static(_cli.fileUtils.concatPath(_cli.config.root, _cli.config.custom)));
    }
  }

  var pluginsPartials = _cli.Plugins.instance.getPartials();
  Array.prototype.forEach.call(pluginsPartials, function (pluginPartials) {
    app.use(_express2.default.static(pluginPartials));
  });

  app.use(_express2.default.static(__dirname + '/node_modules/handlebars/dist'));
  app.use((0, _connectBusboy2.default)({
    limits: {
      fileSize: _cli.config.upload.fileSizelimit
    }
  }));
  app.use(_bodyParser2.default.json());
  app.use(_bodyParser2.default.urlencoded({ extended: true }));

  // depending on the way you serve this app, cookie.secure will be set
  // in Production, this app has to be reverse-proxified
  app.use((0, _expressSession2.default)({
    name: 'sessionId',
    secret: _cli.config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: _cli.config.cookie.secure },
    proxy: true
  }));

  _cli.Hooks.instance.trigger('afterExpress', app, _express2.default);

  if (_cli.fileUtils.isFile(_cli.fileUtils.concatPath(_cli.config.root, 'cert.pem'))) {
    var server = _https2.default.createServer(opts, app);
    server.listen(port, function () {
      console.log(_cliColor2.default.green('\nserver running at https://localhost:' + port + '/'));
      if (process.env.OPENURL) _openurl2.default.open('https://localhost:' + port + '/abe/');
    });
  } else {
    app.listen(port, function () {
      console.log(_cliColor2.default.green('\nserver running at http://localhost:' + port + '/'));
      if (process.env.OPENURL) _openurl2.default.open('http://localhost:' + port + '/abe/');
    });
  }

  // important : require here so config.root is defined
  var controllers = require('./controllers');
  app.use(controllers.default);
});