'use strict'

import { Revision } from "./models"
import { sequelize } from './models'

// app
// external modules
const express = require('express');

const ejs = require('ejs');
const passport = require('passport');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const fs = require('fs');
const path = require('path');

const morgan = require('morgan');
const passportSocketIo = require('passport.socketio');
const helmet = require('helmet');
const i18n = require('i18n');
const flash = require('connect-flash');

// core
const config = require('./config');
const logger = require('./logger');
const errors = require('./errors');
const csp = require('./csp');

// server setup
const app = express();
let server: any = null;
if (config.useSSL) {
  const ca = (function () {
    let i, len, results;
    results = []
    for (i = 0, len = config.sslCAPath.length; i < len; i++) {
      results.push(fs.readFileSync(config.sslCAPath[i], 'utf8'))
    }
    return results
  })();
  const options = {
    key: fs.readFileSync(config.sslKeyPath, 'utf8'),
    cert: fs.readFileSync(config.sslCertPath, 'utf8'),
    ca: ca,
    dhparam: fs.readFileSync(config.dhParamPath, 'utf8'),
    requestCert: false,
    rejectUnauthorized: false
  };
  server = require('https').createServer(options, app)
} else {
  server = require('http').createServer(app)
}

// logger
app.use(morgan('combined', {
  'stream': logger.stream
}))

// socket io
const io = require('socket.io')(server);
io.engine.ws = new (require('ws').Server)({
  noServer: true,
  perMessageDeflate: false
})

// others
const realtime = require('./realtime');

// assign socket io to realtime
realtime.io = io

// methodOverride
app.use(methodOverride('_method'))

// session store
const sessionStore = new SequelizeStore({
  db: sequelize
});

// compression
app.use(compression())

// use hsts to tell https users stick to this
if (config.hsts.enable) {
  app.use(helmet.hsts({
    maxAge: config.hsts.maxAgeSeconds,
    includeSubdomains: config.hsts.includeSubdomains,
    preload: config.hsts.preload
  }))
} else if (config.useSSL) {
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
if (config.csp.enable) {
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
  directory: path.resolve(__dirname, config.localesPath),
  updateFiles: config.updateI18nFiles
})

app.use(cookieParser())

app.use(i18n.init)

// routes without sessions
// static files
app.use('/', express.static(path.resolve(__dirname, config.publicPath), { maxAge: config.staticCacheTime, index: false, redirect: false }))
app.use('/docs', express.static(path.resolve(__dirname, config.docsPath), { maxAge: config.staticCacheTime, redirect: false }))
app.use('/uploads', express.static(path.resolve(__dirname, config.uploadsPath), { maxAge: config.staticCacheTime, redirect: false }))
app.use('/default.md', express.static(path.resolve(__dirname, config.defaultNotePath), { maxAge: config.staticCacheTime }))

// session
app.use(session({
  name: config.sessionName,
  secret: config.sessionSecret,
  resave: false, // don't save session if unmodified
  saveUninitialized: true, // always create session to ensure the origin
  rolling: true, // reset maxAge on every response
  cookie: {
    maxAge: config.sessionLife
  },
  store: sessionStore
}))

// session resumption
const tlsSessionStore = {};
server.on('newSession', function (id, data, cb) {
  tlsSessionStore[id.toString('hex')] = data
  cb()
})
server.on('resumeSession', function (id, cb) {
  cb(null, tlsSessionStore[id.toString('hex')] || null)
})

// middleware which blocks requests when we're too busy
app.use(require('./web/middleware/tooBusy'))

app.use(flash())

// passport
app.use(passport.initialize())
app.use(passport.session())

// check uri is valid before going further
app.use(require('./web/middleware/checkURIValid'))
// redirect url without trailing slashes
app.use(require('./web/middleware/redirectWithoutTrailingSlashes'))
app.use(require('./web/middleware/codiMDVersion'))

// routes need sessions
// template files
app.set('views', config.viewPath)
// set render engine
app.engine('ejs', ejs.renderFile)
// set view engine
app.set('view engine', 'ejs')
// set generally available variables for all views
app.locals.useCDN = config.useCDN
app.locals.serverURL = config.serverURL
app.locals.sourceURL = config.sourceURL
app.locals.allowAnonymous = config.allowAnonymous
app.locals.allowAnonymousEdits = config.allowAnonymousEdits
app.locals.authProviders = {
  facebook: config.isFacebookEnable,
  twitter: config.isTwitterEnable,
  github: config.isGitHubEnable,
  gitlab: config.isGitLabEnable,
  dropbox: config.isDropboxEnable,
  google: config.isGoogleEnable,
  ldap: config.isLDAPEnable,
  ldapProviderName: config.ldap.providerName,
  saml: config.isSAMLEnable,
  oauth2: config.isOAuth2Enable,
  oauth2ProviderName: config.oauth2.providerName,
  openID: config.isOpenIDEnable,
  email: config.isEmailEnable,
  allowEmailRegister: config.allowEmailRegister
}

// Export/Import menu items
app.locals.enableDropBoxSave = config.isDropboxEnable
app.locals.enableGitHubGist = config.isGitHubEnable
app.locals.enableGitlabSnippets = config.isGitlabSnippetsEnable

app.use(require('./web/baseRouter'))
app.use(require('./web/statusRouter'))
app.use(require('./web/auth'))
app.use(require('./web/historyRouter'))
app.use(require('./web/userRouter'))
app.use(require('./web/imageRouter'))
app.use(require('./web/note/router'))

// response not found if no any route matxches
app.get('*', function (req, res) {
  errors.errorNotFound(res)
})

// socket.io secure
io.use(realtime.secure)
// socket.io auth
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: config.sessionName,
  secret: config.sessionSecret,
  store: sessionStore,
  success: realtime.onAuthorizeSuccess,
  fail: realtime.onAuthorizeFail
}))
// socket.io heartbeat
io.set('heartbeat interval', config.heartbeatInterval)
io.set('heartbeat timeout', config.heartbeatTimeout)
// socket.io connection
io.sockets.on('connection', realtime.connection)

// listen
function startListen () {
  let address;
  const listenCallback = function () {
    const schema = config.useSSL ? 'HTTPS' : 'HTTP';
    logger.info('%s Server listening at %s', schema, address)
    realtime.maintenance = false
  };

  // use unix domain socket if 'path' is specified
  if (config.path) {
    address = config.path
    server.listen(config.path, listenCallback)
  } else {
    address = config.host + ':' + config.port
    server.listen(config.port, config.host, listenCallback)
  }
}

// sync db then start listen
sequelize.authenticate().then(function () {
  // check if realtime is ready
  if (realtime.isReady()) {
    Revision.checkAllNotesRevision(function (err, notes) {
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
    const socket = io.sockets.sockets[key];
    // notify client server going into maintenance status
    socket.emit('maintenance')
    setTimeout(function () {
      socket.disconnect(true)
    }, 0)
  })
  if (config.path) {
    fs.unlink(config.path)
  }
  const checkCleanTimer = setInterval(function () {
    if (realtime.isReady()) {
      Revision.checkAllNotesRevision(function (err, notes) {
        if (err) return logger.error(err)
        if (!notes || notes.length <= 0) {
          clearInterval(checkCleanTimer)
          return process.exit(0)
        }
      })
    }
  }, 100);
}
process.on('SIGINT', handleTermSignals)
process.on('SIGTERM', handleTermSignals)
process.on('SIGQUIT', handleTermSignals)
