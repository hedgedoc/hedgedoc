'use strict'
// app
// external modules
var express = require('express')

var ejs = require('ejs')
var passport = require('passport')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var compression = require('compression')
var session = require('express-session')
var SequelizeStore = require('connect-session-sequelize')(session.Store)
var fs = require('fs')
var path = require('path')

var morgan = require('morgan')
var passportSocketIo = require('passport.socketio')
var helmet = require('helmet')
var i18n = require('i18n')
var flash = require('connect-flash')

// core
var config = require('./lib/config')
var logger = require('./lib/logger')
var errors = require('./lib/errors')
var models = require('./lib/models')
var csp = require('./lib/csp')

// server setup
var app = express()
var server = null
if (config.get('useSSL')) {
  var ca = (function () {
    var i, len, results
    results = []
    for (i = 0, len = config.get('sslCAPath').length; i < len; i++) {
      results.push(fs.readFileSync(config.get('sslCAPath[i]'), 'utf8'))
    }
    return results
  })()
  var options = {
    key: fs.readFileSync(config.get('sslKeyPath'), 'utf8'),
    cert: fs.readFileSync(config.get('sslCertPath'), 'utf8'),
    ca: ca,
    dhparam: fs.readFileSync(config.get('dhParamPath'), 'utf8'),
    requestCert: false,
    rejectUnauthorized: false
  }
  server = require('https').createServer(options, app)
} else {
  server = require('http').createServer(app)
}

// logger
app.use(morgan('combined', {
  'stream': logger.stream
}))

// socket io
var io = require('socket.io')(server)
io.engine.ws = new (require('ws').Server)({
  noServer: true,
  perMessageDeflate: false
})

// others
var realtime = require('./lib/realtime.js')

// assign socket io to realtime
realtime.io = io

// methodOverride
app.use(methodOverride('_method'))

// session store
var sessionStore = new SequelizeStore({
  db: models.sequelize
})

// compression
app.use(compression())

// use hsts to tell https users stick to this
if (config.get('hsts').enable) {
  app.use(helmet.hsts({
    maxAge: config.get('hsts').maxAgeSeconds,
    includeSubdomains: config.get('hsts').includeSubdomains,
    preload: config.get('hsts').preload
  }))
} else if (config.get('useSSL')) {
  logger.info('Consider enabling HSTS for extra security:')
  logger.info('https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security')
}

// Add referrer policy to improve privacy
app.use(
  helmet.referrerPolicy({
    policy: 'same-origin'
  })
)

// Generate a random nonce per request, for CSP with inline scripts
app.use(csp.addNonceToLocals)

// use Content-Security-Policy to limit XSS, dangerous plugins, etc.
// https://helmetjs.github.io/docs/csp/
if (config.get('csp').enable) {
  app.use(helmet.contentSecurityPolicy({
    directives: csp.computeDirectives()
  }))
} else {
  logger.info('Content-Security-Policy is disabled. This may be a security risk.')
}

i18n.configure({
  locales: ['en', 'zh-CN', 'zh-TW', 'fr', 'de', 'ja', 'es', 'ca', 'el', 'pt', 'it', 'tr', 'ru', 'nl', 'hr', 'pl', 'uk', 'hi', 'sv', 'eo', 'da', 'ko', 'id', 'sr', 'vi', 'ar', 'cs', 'sk'],
  cookie: 'locale',
  indent: '    ', // this is the style poeditor.com exports it, this creates less churn
  directory: path.join(__dirname, '/locales'),
  updateFiles: config.get('updateI18nFiles')
})

app.use(cookieParser())

app.use(i18n.init)

// routes without sessions
// static files
app.use('/', express.static(path.join(__dirname, '/public'), { maxAge: config.get('staticCacheTime'), index: false, redirect: false }))
app.use('/docs', express.static(path.resolve(__dirname, config.get('docsPath')), { maxAge: config.get('staticCacheTime'), redirect: false }))
app.use('/uploads', express.static(path.resolve(__dirname, config.get('uploadsPath')), { maxAge: config.get('staticCacheTime'), redirect: false }))
app.use('/default.md', express.static(path.resolve(__dirname, config.get('defaultNotePath')), { maxAge: config.get('staticCacheTime') }))

// session
app.use(session({
  name: config.get('sessionName'),
  secret: config.get('sessionSecret'),
  resave: false, // don't save session if unmodified
  saveUninitialized: true, // always create session to ensure the origin
  rolling: true, // reset maxAge on every response
  cookie: {
    maxAge: config.get('sessionLife')
  },
  store: sessionStore
}))

// session resumption
var tlsSessionStore = {}
server.on('newSession', function (id, data, cb) {
  tlsSessionStore[id.toString('hex')] = data
  cb()
})
server.on('resumeSession', function (id, cb) {
  cb(null, tlsSessionStore[id.toString('hex')] || null)
})

// middleware which blocks requests when we're too busy
app.use(require('./lib/web/middleware/tooBusy'))

app.use(flash())

// passport
app.use(passport.initialize())
app.use(passport.session())

// check uri is valid before going further
app.use(require('./lib/web/middleware/checkURIValid'))
// redirect url without trailing slashes
app.use(require('./lib/web/middleware/redirectWithoutTrailingSlashes'))
app.use(require('./lib/web/middleware/codiMDVersion'))

// routes need sessions
// template files
app.set('views', config.get('viewPath'))
// set render engine
app.engine('ejs', ejs.renderFile)
// set view engine
app.set('view engine', 'ejs')
// set generally available variables for all views
app.locals.useCDN = config.get('useCDN')
app.locals.serverURL = config.get('serverURL')
app.locals.sourceURL = config.get('sourceURL')
app.locals.allowAnonymous = config.get('allowAnonymous')
app.locals.allowAnonymousEdits = config.get('allowAnonymousEdits')
app.locals.allowPDFExport = config.get('allowPDFExport')
app.locals.authProviders = {
  facebook: config.get('isFacebookEnable'),
  twitter: config.get('isTwitterEnable'),
  github: config.get('isGitHubEnable'),
  gitlab: config.get('isGitLabEnable'),
  mattermost: config.get('isMattermostEnable'),
  dropbox: config.get('isDropboxEnable'),
  google: config.get('isGoogleEnable'),
  ldap: config.get('isLDAPEnable'),
  ldapProviderName: config.get('ldap').providerName,
  saml: config.get('isSAMLEnable'),
  oauth2: config.get('isOAuth2Enable'),
  oauth2ProviderName: config.get('oauth2').providerName,
  openID: config.get('isOpenIDEnable'),
  email: config.get('isEmailEnable'),
  allowEmailRegister: config.get('allowEmailRegister')
}

//') Export/Import menu items
app.locals.enableDropBoxSave = config.get('isDropboxEnable')
app.locals.enableGitHubGist = config.get('isGitHubEnable')
app.locals.enableGitlabSnippets = config.get('isGitlabSnippetsEnable')

app.use(require('./lib/web/baseRouter'))
app.use(require('./lib/web/statusRouter'))
app.use(require('./lib/web/auth'))
app.use(require('./lib/web/historyRouter'))
app.use(require('./lib/web/userRouter'))
app.use(require('./lib/web/imageRouter'))
app.use(require('./lib/web/note/router'))

// response not found if no any route matxches
app.get('*', function (req, res) {
  errors.errorNotFound(res)
})

// socket.io secure
io.use(realtime.secure)
// socket.io auth
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: config.get('sessionName'),
  secret: config.get('sessionSecret'),
  store: sessionStore,
  success: realtime.onAuthorizeSuccess,
  fail: realtime.onAuthorizeFail
}))
// socket.io heartbeat
io.set('heartbeat interval', config.get('heartbeatInterval'))
io.set('heartbeat timeout', config.get('heartbeatTimeout'))
// socket.io connection
io.sockets.on('connection', realtime.connection)

// listen
function startListen () {
  var address
  var listenCallback = function () {
    var schema = config.get('useSSL') ? 'HTTPS' : 'HTTP'
    logger.info('%s Server listening at %s', schema, address)
    realtime.maintenance = false
  }

  // use unix domain socket if 'path' is specified
  if (config.get('path')) {
    address = config.get('path')
    server.listen(config.get('path'), listenCallback)
  } else {
    address = config.get('host') + ':' + config.get('port')
    server.listen(config.get('port'), config.get('host'), listenCallback)
  }
}

// sync db then start listen
models.sequelize.sync().then(function () {
  // check if realtime is ready
  if (realtime.isReady()) {
    models.Revision.checkAllNotesRevision(function (err, notes) {
      if (err) throw new Error(err)
      if (!notes || notes.length <= 0) return startListen()
    })
  } else {
    throw new Error('server still not ready after db synced')
  }
})

// log uncaught exception
process.on('uncaughtException', function (err) {
  logger.error('An uncaught exception has occured.')
  logger.error(err)
  logger.error('Process will exit now.')
  process.exit(1)
})

// install exit handler
function handleTermSignals () {
  logger.info('CodiMD has been killed by signal, try to exit gracefully...')
  realtime.maintenance = true
  // disconnect all socket.io clients
  Object.keys(io.sockets.sockets).forEach(function (key) {
    var socket = io.sockets.sockets[key]
    // notify client server going into maintenance status
    socket.emit('maintenance')
    setTimeout(function () {
      socket.disconnect(true)
    }, 0)
  })
  if (config.get('path')) {
    fs.unlink(config.get('path'))
  }
  var checkCleanTimer = setInterval(function () {
    if (realtime.isReady()) {
      models.Revision.checkAllNotesRevision(function (err, notes) {
        if (err) return logger.error(err)
        if (!notes || notes.length <= 0) {
          clearInterval(checkCleanTimer)
          return process.exit(0)
        }
      })
    }
  }, 100)
}
process.on('SIGINT', handleTermSignals)
process.on('SIGTERM', handleTermSignals)
process.on('SIGQUIT', handleTermSignals)
