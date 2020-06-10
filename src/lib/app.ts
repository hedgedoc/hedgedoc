import compression from 'compression'
import flash from 'connect-flash'
// eslint-disable-next-line @typescript-eslint/camelcase
import connect_session_sequelize from 'connect-session-sequelize'
import cookieParser from 'cookie-parser'
import ejs from 'ejs'
import express from 'express'
import session from 'express-session'
import childProcess from 'child_process'
import helmet from 'helmet'
import http from 'http'
import https from 'https'
import i18n from 'i18n'
import fs from 'fs'
import methodOverride from 'method-override'
import morgan from 'morgan'
import passport from 'passport'
import passportSocketIo from 'passport.socketio'
import path from 'path'
import SocketIO from 'socket.io'
import WebSocket from 'ws'

import { config } from './config'
import { addNonceToLocals, computeDirectives } from './csp'
import { errors } from './errors'
import { logger } from './logger'
import { Revision, sequelize } from './models'
import { realtime, State } from './realtime'
import { handleTermSignals } from './utils/functions'
import { AuthRouter, BaseRouter, HistoryRouter, ImageRouter, NoteRouter, StatusRouter, UserRouter } from './web/'
import { tooBusy, checkURI, redirectWithoutTrailingSlashes, codiMDVersion } from './web/middleware'

const rootPath = path.join(__dirname, '..')

// session store
const SequelizeStore = connect_session_sequelize(session.Store)

const sessionStore = new SequelizeStore({
  db: sequelize
})

// server setup
const app = express()
let server: http.Server
if (config.useSSL) {
  const ca: string[] = []
  for (const path of config.sslCAPath) {
    ca.push(fs.readFileSync(path, 'utf8'))
  }

  const options = {
    key: fs.readFileSync(config.sslKeyPath, 'utf8'),
    cert: fs.readFileSync(config.sslCertPath, 'utf8'),
    ca: ca,
    dhparam: fs.readFileSync(config.dhParamPath, 'utf8'),
    requestCert: false,
    rejectUnauthorized: false,
    heartbeatInterval: config.heartbeatInterval,
    heartbeatTimeout: config.heartbeatTimeout
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

// socket io
const io = SocketIO(server, { cookie: false })
io.engine.ws = new WebSocket.Server({
  noServer: true,
  perMessageDeflate: false
})
// assign socket io to realtime
realtime.io = io

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
// socket.io connection
io.sockets.on('connection', realtime.connection)

// logger
app.use(morgan('combined', {
  stream: {
    write: function (message): void {
      logger.info(message)
    }
  }
}))

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

// Generate a random nonce per request, for CSP with inline scripts
app.use(addNonceToLocals)

// use Content-Security-Policy to limit XSS, dangerous plugins, etc.
// https://helmetjs.github.io/docs/csp/
if (config.csp.enable) {
  app.use(helmet.contentSecurityPolicy({
    directives: computeDirectives()
  }))
} else {
  logger.info('Content-Security-Policy is disabled. This may be a security risk.')
}

// Add referrer policy to improve privacy
app.use(
  helmet.referrerPolicy({
    policy: 'same-origin'
  })
)

// methodOverride
app.use(methodOverride('_method'))

// compression
app.use(compression())

app.use(cookieParser())

i18n.configure({
  locales: ['en', 'zh-CN', 'zh-TW', 'fr', 'de', 'ja', 'es', 'ca', 'el', 'pt', 'it', 'tr', 'ru', 'nl', 'hr', 'pl', 'uk', 'hi', 'sv', 'eo', 'da', 'ko', 'id', 'sr', 'vi', 'ar', 'cs', 'sk'],
  cookie: 'locale',
  indent: '    ', // this is the style poeditor.com exports it, this creates less churn
  directory: path.resolve(rootPath, config.localesPath),
  updateFiles: config.updateI18nFiles
})

app.use(i18n.init)

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

// session
app.use(session({
  name: config.sessionName,
  secret: config.sessionSecret,
  resave: false, // don't save session if unmodified
  saveUninitialized: true, // always create session to ensure the origin
  rolling: true, // reset maxAge on every response
  cookie: {
    maxAge: config.sessionLife,
    sameSite: 'strict',
    secure: config.useSSL || config.protocolUseSSL || false
  },
  store: sessionStore
}))

// session resumption
const tlsSessionStore = {}
server.on('newSession', function (id, data, cb) {
  tlsSessionStore[id.toString('hex')] = data
  cb()
})
server.on('resumeSession', function (id, cb) {
  cb(null, tlsSessionStore[id.toString('hex')] || null)
})

// middleware which blocks requests when we're too busy
app.use(tooBusy)

app.use(flash())

// passport
app.use(passport.initialize())
app.use(passport.session())

// check uri is valid before going further
app.use(checkURI)
// redirect url without trailing slashes
app.use(redirectWithoutTrailingSlashes)
app.use(codiMDVersion)

// routes without sessions
// static files
app.use('/', express.static(path.resolve(rootPath, config.publicPath), { maxAge: config.staticCacheTime, index: false, redirect: false }))
app.use('/docs', express.static(path.resolve(rootPath, config.docsPath), { maxAge: config.staticCacheTime, redirect: false }))
app.use('/uploads', express.static(path.resolve(rootPath, config.uploadsPath), { maxAge: config.staticCacheTime, redirect: false }))
app.use('/default.md', express.static(path.resolve(rootPath, config.defaultNotePath), { maxAge: config.staticCacheTime }))

// routes need sessions
// template files
app.set('views', config.viewPath)
// set render engine
app.engine('ejs', ejs.renderFile)
// set view engine
app.set('view engine', 'ejs')

app.use(BaseRouter)
app.use(StatusRouter)
app.use(AuthRouter)
app.use(HistoryRouter)
app.use(UserRouter)
app.use(ImageRouter)
app.use(NoteRouter)

// response not found if no any route matxches
app.get('*', function (req, res) {
  errors.errorNotFound(res)
})

// log uncaught exception
process.on('uncaughtException', function (err) {
  logger.error('An uncaught exception has occured.')
  logger.error(err)
  logger.error('Process will exit now.')
  process.exit(1)
})

// listen
function startListen (): void {
  let address
  const listenCallback = function (): void {
    const schema = config.useSSL ? 'HTTPS' : 'HTTP'
    logger.info('%s Server listening at %s', schema, address)
    realtime.state = State.Running
  }

  const unixCallback = function (): void {
    const throwErr = function (err): void { if (err) throw err }
    if (config.socket.owner !== undefined) {
      childProcess.spawn('chown', [config.socket.owner, config.path]).on('error', throwErr)
    }
    if (config.socket.group !== undefined) {
      childProcess.spawn('chgrp', [config.socket.group, config.path]).on('error', throwErr)
    }
    if (config.socket.mode !== undefined) {
      fs.chmod(config.path, config.socket.mode, throwErr)
    }
    listenCallback()
  }
  // use unix domain socket if 'path' is specified
  if (config.path) {
    address = config.path
    server.listen(config.path, unixCallback)
  } else {
    address = config.host + ':' + config.port
    server.listen(config.port, config.host, listenCallback)
  }
}

// sync db then start listen
sequelize.authenticate().then(function () {
  sessionStore.sync()
  // check if realtime is ready
  if (realtime.isReady()) {
    Revision.checkAllNotesRevision(function (err, notes) {
      if (err) {
        throw new Error(err)
      }
      if (!notes || notes.length <= 0) {
        return startListen()
      }
    })
  } else {
    throw new Error('server still not ready after db synced')
  }
})

process.on('SIGINT', () => handleTermSignals(io))
process.on('SIGTERM', () => handleTermSignals(io))
process.on('SIGQUIT', () => handleTermSignals(io))
