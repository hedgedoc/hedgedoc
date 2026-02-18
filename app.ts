'use strict'
// app
// external modules
import express = require('express')

import ejs = require('ejs')
import passport = require('passport')
import methodOverride = require('method-override')
import cookieParser = require('cookie-parser')
import compression = require('compression')
import session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
import * as http from 'http'
import * as https from 'https'
import fs = require('fs')
import path = require('path')
import { Server } from 'socket.io'

import morgan = require('morgan')
const passportSocketIo = require('passport.socketio')
import helmet = require('helmet')
import i18n = require('i18n')
import flash = require('connect-flash')
const apiMetrics = require('prometheus-api-metrics')

// core
import config = require('./lib/config')
import logger = require('./lib/logger')
import * as errors from './lib/errors'
import models = require('./lib/models')
import * as csp from './lib/csp'
import * as metrics from './lib/prometheus'
import { useUnless } from './lib/utils'

const supportedLocalesList: string[] = Object.keys(require('../locales/_supported.json'))

// server setup
const app = express()
let server: http.Server | https.Server = null as unknown as http.Server | https.Server
if (config.useSSL) {
  const ca: string[] = (function () {
    const results: string[] = []
    for (let i = 0, len = config.sslCAPath.length; i < len; i++) {
      results.push(fs.readFileSync(config.sslCAPath[i], 'utf8'))
    }
    return results
  })()
  const options = {
    key: fs.readFileSync(config.sslKeyPath, 'utf8'),
    cert: fs.readFileSync(config.sslCertPath, 'utf8'),
    ca,
    dhparam: fs.readFileSync(config.dhParamPath, 'utf8'),
    requestCert: false,
    rejectUnauthorized: false
  }
  server = https.createServer(options, app)
} else {
  server = http.createServer(app)
}

// if we manage to provide HTTPS domains, but don't provide TLS ourselves
// obviously a proxy is involded. In order to make sure express is aware of
// this, we provide the option to trust proxies here.
if (!config.useSSL && config.protocolUseSSL) {
  app.set('trust proxy', 1)
}

// check if the request is from container healthcheck
function isContainerHealthCheck (req: express.Request, _res: express.Response): boolean {
  return req.headers['user-agent'] === 'hedgedoc-container-healthcheck/1.0' && req.ip === '127.0.0.1'
}

// logger
app.use(morgan('combined', {
  skip: isContainerHealthCheck,
  stream: logger.stream as any
}))

// Register prometheus metrics endpoint
if (config.enableStatsApi) {
  app.use(apiMetrics())
  metrics.setupCustomPrometheusMetrics()
}

// socket io
const io = new Server(server, {
  pingInterval: config.heartbeatInterval,
  pingTimeout: config.heartbeatTimeout,
  cookie: false,
  cors: {
    origin: config.serverURL,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// others
const realtime = require('./lib/realtime')

// assign socket io to realtime
realtime.io = io

// methodOverride
app.use(methodOverride('_method'))

// session store
const sessionStore = new SequelizeStore({
  db: models.sequelize
})

// compression
app.use(compression())

// use hsts to tell https users stick to this
if (config.hsts.enable) {
  app.use(helmet.hsts({
    maxAge: config.hsts.maxAgeSeconds,
    includeSubDomains: config.hsts.includeSubdomains,
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
    directives: csp.computeDirectives(),
    useDefaults: false
  }))
} else {
  logger.info('Content-Security-Policy is disabled. This may be a security risk.')
}

i18n.configure({
  locales: supportedLocalesList,
  cookie: 'locale',
  indent: '    ', // this is the style poeditor.com exports it, this creates less churn
  directory: path.join(__dirname, '..', 'locales'),
  updateFiles: config.updateI18nFiles
})

app.use(cookieParser())

app.use(i18n.init)

// routes without sessions
// security headers for uploads
app.use('/uploads', (req, res, next) => {
  res.set('Content-Disposition', 'attachment')
  res.set('Content-Security-Policy', "default-src 'none'; sandbox")
  next()
})

// static files
app.use('/', express.static(path.join(__dirname, '..', 'public'), {
  maxAge: config.staticCacheTime,
  index: false,
  redirect: false
}))
app.use('/docs', express.static(path.resolve(__dirname, config.docsPath), {
  maxAge: config.staticCacheTime,
  redirect: false
}))
app.use('/uploads', express.static(path.resolve(__dirname, config.uploadsPath), {
  maxAge: config.staticCacheTime,
  redirect: false
}))
app.use('/default.md', express.static(path.resolve(__dirname, config.defaultNotePath), {
  maxAge: config.staticCacheTime
}))

// session
app.use(useUnless(['/status', '/metrics', '/_health'], session({
  name: config.sessionName,
  secret: config.sessionSecret,
  resave: false, // don't save session if unmodified
  saveUninitialized: true, // always create session to ensure the origin
  rolling: true, // reset maxAge on every response
  cookie: {
    maxAge: config.sessionLife,
    sameSite: config.cookiePolicy, // be careful: setting a SameSite value of none without https breaks the editor
    secure: config.useSSL || config.protocolUseSSL || false
  },
  store: sessionStore
})))

// session resumption
const tlsSessionStore: Record<string, any> = {}
server.on('newSession', function (id: Buffer, data: Buffer, cb: () => void) {
  tlsSessionStore[id.toString('hex')] = data
  cb()
})
server.on('resumeSession', function (id: Buffer, cb: (err: Error | null, data: Buffer | null) => void) {
  cb(null, tlsSessionStore[id.toString('hex')] || null)
})

// middleware which blocks requests when we're too busy
app.use(require('./lib/web/middleware/tooBusy'))

app.use(flash())

// passport
app.use(passport.initialize())
app.use(useUnless(['/status', '/metrics', '/_health'], passport.session()))

// check uri is valid before going further
app.use(require('./lib/web/middleware/checkURIValid'))
// redirect url without trailing slashes
app.use(require('./lib/web/middleware/redirectWithoutTrailingSlashes'))
app.use(require('./lib/web/middleware/hedgeDocVersion'))

// routes need sessions
// template files
app.set('views', config.viewPath)
// set render engine
app.engine('ejs', ejs.renderFile)
// set view engine
app.set('view engine', 'ejs')
// set generally available variables for all views
app.locals.serverURL = config.serverURL
app.locals.sourceURL = config.sourceURL
app.locals.allowAnonymous = config.allowAnonymous
app.locals.allowAnonymousEdits = config.allowAnonymousEdits
app.locals.disableNoteCreation = config.disableNoteCreation
app.locals.authProviders = {
  facebook: config.isFacebookEnable,
  twitter: config.isTwitterEnable,
  github: config.isGitHubEnable,
  gitlab: config.isGitLabEnable,
  mattermost: config.isMattermostEnable,
  dropbox: config.isDropboxEnable,
  google: config.isGoogleEnable,
  ldap: config.isLDAPEnable,
  ldapProviderName: config.ldap.providerName,
  saml: config.isSAMLEnable,
  samlProviderName: config.saml.providerName,
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
  cookieParser,
  key: config.sessionName,
  secret: config.sessionSecret,
  store: sessionStore,
  success: realtime.onAuthorizeSuccess,
  fail: realtime.onAuthorizeFail
}))
// socket.io connection
io.sockets.on('connection', realtime.connection)

// listen
function startListen () {
  let address: string
  const listenCallback = function (): void {
    const schema = config.useSSL ? 'HTTPS' : 'HTTP'
    logger.info('%s Server listening at %s', schema, address)
    realtime.maintenance = false
  }

  // use unix domain socket if 'path' is specified
  if (config.path) {
    address = config.path
    server.listen(config.path, listenCallback)
  } else {
    address = config.host + ':' + config.port
    server.listen(config.port, config.host, listenCallback)
  }
}

const maxDBTries: number = 30
let currentDBTry: number = 1
function syncAndListen (): void {
  // sync db then start listen
  models.sequelize.authenticate().then(function () {
    models.runMigrations().then(() => {
      sessionStore.sync()
      // check if realtime is ready
      if (realtime.isReady()) {
        models.Revision.checkAllNotesRevision(function (err: any, notes: any[]) {
          if (err) throw new Error(err)
          if (!notes || notes.length <= 0) return startListen()
        })
      } else {
        logger.error('server still not ready after db synced')
        process.exit(1)
      }
    })
  }).catch((dbError: Error) => {
    if (currentDBTry < maxDBTries) {
      logger.warn(`Database cannot be reached. Try ${currentDBTry} of ${maxDBTries}. (${dbError})`)
      currentDBTry++
      setTimeout(function () {
        syncAndListen()
      }, 1000)
    } else {
      logger.error('Cannot reach database! Exiting.')
      process.exit(1)
    }
  })
}
syncAndListen()

// log uncaught exception
process.on('uncaughtException', function (err) {
  logger.error('An uncaught exception has occured.')
  logger.error(err)
  logger.error('Process will exit now.')
  process.exit(1)
})

let alreadyHandlingTermSignals: boolean = false
// install exit handler
function handleTermSignals (): void {
  if (alreadyHandlingTermSignals) {
    logger.info('Forcefully exiting.')
    process.exit(1)
  }
  logger.info('HedgeDoc has been killed by signal, try to exit gracefully...')
  alreadyHandlingTermSignals = true
  realtime.maintenance = true
  // disconnect all socket.io clients
  Array.from(io.sockets.sockets.keys()).forEach(function (key) {
    const socket = io.sockets.sockets.get(key)
    if (!socket) return
    // notify client server going into maintenance status
    socket.emit('maintenance')
    setTimeout(function () {
      socket.disconnect(true)
    }, 0)
  })
  if (config.path) {
    fs.unlink(config.path, err => {
      if (err) {
        logger.error(`Could not cleanup socket: ${err.message}`)
      } else {
        logger.info('Successfully cleaned up socket')
      }
    })
  }
  const maxCleanTries: number = 30
  let currentCleanTry: number = 1
  const checkCleanTimer = setInterval(function () {
    if (realtime.isReady()) {
      models.Revision.checkAllNotesRevision(function (err: any, notes: any[]) {
        if (err) {
          logger.error('Error while saving note revisions: ' + err)
          if (currentCleanTry <= maxCleanTries) {
            logger.warn(`Trying again. Try ${currentCleanTry} of ${maxCleanTries}`)
            currentCleanTry++
            return null
          }
          logger.error(`Could not save note revisions after ${maxCleanTries} tries! Exiting.`)
          process.exit(1)
        }
        if (!notes || notes.length <= 0) {
          clearInterval(checkCleanTimer)
          process.exit(0)
        }
      })
    } else {
      logger.warn(`Real time server not ready for shutdown, trying again (${currentCleanTry}/${maxCleanTries})...`)
      currentCleanTry++
      if (currentCleanTry > maxCleanTries) {
        logger.error('Could not save note revisions after shutdown! Exiting.')
        process.exit(1)
      }
    }
  }, 200)
}
process.on('SIGINT', handleTermSignals)
process.on('SIGTERM', handleTermSignals)
process.on('SIGQUIT', handleTermSignals)
