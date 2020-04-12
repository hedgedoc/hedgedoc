import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { merge } from 'lodash'
import { Environment, Permission } from './enum'
import { logger } from '../logger'
import { getGitCommit, getGitHubURL } from './utils'
import { defaultConfig } from './default'
import { defaultSSL } from './defaultSSL'
import { oldDefault } from './oldDefault'
import { oldEnvironment } from './oldEnvironment'
import { hackmdEnvironment } from './hackmdEnvironment'
import { environment } from './environment'
import { dockerSecret } from './dockerSecret'
import deepFreeze = require('deep-freeze')

const appRootPath = path.resolve(__dirname, '../../')
const env = process.env.NODE_ENV || Environment.development
const debugConfig = {
  debug: (env === Environment.development)
}

// Get version string from package.json
const { version, repository } = require(path.join(appRootPath, 'package.json'))

const commitID = getGitCommit(appRootPath)
const sourceURL = getGitHubURL(repository.url, commitID || version)
const fullversion = commitID ? `${version}-${commitID}` : version

const packageConfig = {
  version: version,
  minimumCompatibleVersion: '0.5.0',
  fullversion: fullversion,
  sourceURL: sourceURL
}

const configFilePath = path.resolve(appRootPath, process.env.CMD_CONFIG_FILE ||
  'config.json')
const fileConfig = fs.existsSync(configFilePath) ? require(configFilePath)[env] : undefined
merge(defaultConfig, defaultSSL)
merge(defaultConfig, oldDefault)
merge(defaultConfig, debugConfig)
merge(defaultConfig, packageConfig)
merge(defaultConfig, fileConfig)
merge(defaultConfig, oldEnvironment)
merge(defaultConfig, hackmdEnvironment)
merge(defaultConfig, environment)
merge(defaultConfig, dockerSecret)

if (['debug', 'verbose', 'info', 'warn', 'error'].includes(defaultConfig.loglevel)) {
  logger.level = defaultConfig.loglevel
} else {
  logger.error('Selected loglevel %s doesn\'t exist, using default level \'debug\'. Available options: debug, verbose, info, warn, error', defaultConfig.loglevel)
}

// load LDAP CA
if (defaultConfig.ldap?.tlsca) {
  const ca = defaultConfig.ldap.tlsca.split(',')
  const caContent: string[] = []
  for (const i of ca) {
    if (fs.existsSync(i)) {
      caContent.push(fs.readFileSync(i, 'utf8'))
    }
  }
  const tlsOptions = {
    ca: caContent
  }
  defaultConfig.ldap.tlsOptions = defaultConfig.ldap.tlsOptions ? Object.assign(defaultConfig.ldap.tlsOptions, tlsOptions) : tlsOptions
}

// Permission
defaultConfig.permission = Permission
if (!defaultConfig.allowAnonymous && !defaultConfig.allowAnonymousEdits) {
  delete defaultConfig.permission.freely
}
if (!(defaultConfig.defaultPermission in defaultConfig.permission)) {
  defaultConfig.defaultPermission = defaultConfig.permission.editable
}

// cache result, cannot change config in runtime!!!
defaultConfig.isStandardHTTPsPort = (function isStandardHTTPsPort (): boolean {
  return defaultConfig.useSSL && defaultConfig.port === 443
})()
defaultConfig.isStandardHTTPPort = (function isStandardHTTPPort (): boolean {
  return !defaultConfig.useSSL && defaultConfig.port === 80
})()

// cache serverURL
defaultConfig.serverURL = (function getserverurl (): string {
  let url = ''
  if (defaultConfig.domain) {
    const protocol = defaultConfig.protocolUseSSL ? 'https://' : 'http://'
    url = protocol + defaultConfig.domain
    if (defaultConfig.urlAddPort) {
      if (!defaultConfig.isStandardHTTPPort || !defaultConfig.isStandardHTTPsPort) {
        url += ':' + defaultConfig.port
      }
    }
  }
  if (defaultConfig.urlPath) {
    url += '/' + defaultConfig.urlPath
  }
  return url
})()

if (defaultConfig.serverURL === '') {
  logger.warn('Neither \'domain\' nor \'CMD_DOMAIN\' is configured. This can cause issues with various components.\nHint: Make sure \'protocolUseSSL\' and \'urlAddPort\' or \'CMD_PROTOCOL_USESSL\' and \'CMD_URL_ADDPORT\' are configured properly.')
}

defaultConfig.Environment = Environment

// auth method
defaultConfig.isFacebookEnable = defaultConfig.facebook?.clientID && defaultConfig.facebook.clientSecret
defaultConfig.isGoogleEnable = defaultConfig.google?.clientID && defaultConfig.google.clientSecret
defaultConfig.isDropboxEnable = defaultConfig.dropbox?.clientID && defaultConfig.dropbox.clientSecret
defaultConfig.isTwitterEnable = defaultConfig.twitter?.consumerKey && defaultConfig.twitter.consumerSecret
defaultConfig.isEmailEnable = defaultConfig.email
defaultConfig.isOpenIDEnable = defaultConfig.openID
defaultConfig.isGitHubEnable = defaultConfig.github?.clientID && defaultConfig.github.clientSecret
defaultConfig.isGitLabEnable = defaultConfig.gitlab?.clientID && defaultConfig.gitlab.clientSecret
defaultConfig.isLDAPEnable = defaultConfig.ldap?.url
defaultConfig.isSAMLEnable = defaultConfig.saml?.idpSsoUrl
defaultConfig.isOAuth2Enable = defaultConfig.oauth2?.clientID && defaultConfig.oauth2.clientSecret

// Check gitlab api version
if (defaultConfig.gitlab && defaultConfig.gitlab.version !== 'v4' && defaultConfig.gitlab.version !== 'v3') {
  logger.warn('config.js contains wrong version (' + defaultConfig.gitlab.version + ') for gitlab api; it should be \'v3\' or \'v4\'. Defaulting to v4')
  defaultConfig.gitlab.version = 'v4'
}
// If gitlab scope is api, enable snippets Export/import
defaultConfig.isGitlabSnippetsEnable = (!defaultConfig.gitlab?.scope || defaultConfig.gitlab.scope === 'api') && defaultConfig.isGitLabEnable

// Only update i18n files in development setups
defaultConfig.updateI18nFiles = (env === Environment.development)

// merge legacy values
const keys = Object.keys(defaultConfig)
const uppercase = /[A-Z]/
for (let i = keys.length; i--;) {
  const lowercaseKey = keys[i].toLowerCase()
  // if the config contains uppercase letters
  // and a lowercase version of this setting exists
  // and the config with uppercase is not set
  // we set the new config using the old key.
  if (uppercase.test(keys[i]) &&
    defaultConfig[lowercaseKey] !== undefined &&
    fileConfig[keys[i]] === undefined) {
    logger.warn('config.js contains deprecated lowercase setting for ' + keys[i] + '. Please change your config.js file to replace ' + lowercaseKey + ' with ' + keys[i])
    defaultConfig[keys[i]] = defaultConfig[lowercaseKey]
  }
}

// Notify users about the prefix change and inform them they use legacy prefix for environment variables
if (Object.keys(process.env).toString().includes('HMD_')) {
  logger.warn('Using legacy HMD prefix for environment variables. Please change your variables in future. For details see: https://github.com/codimd/server#environment-variables-will-overwrite-other-server-configs')
}

// Generate session secret if it stays on default values
if (defaultConfig.sessionSecret === 'secret') {
  logger.warn('Session secret not set. Using random generated one. Please set `sessionSecret` in your config.js file. All users will be logged out.')
  defaultConfig.sessionSecret = crypto.randomBytes(Math.ceil(defaultConfig.sessionSecretLen / 2)) // generate crypto graphic random number
    .toString('hex') // convert to hexadecimal format
    .slice(0, defaultConfig.sessionSecretLen) // return required number of characters
}

// Validate upload upload providers
if (!['filesystem', 's3', 'minio', 'imgur', 'azure', 'lutim'].includes(defaultConfig.imageUploadType)) {
  logger.error('"imageuploadtype" is not correctly set. Please use "filesystem", "s3", "minio", "azure", "lutim" or "imgur". Defaulting to "filesystem"')
  defaultConfig.imageUploadType = 'filesystem'
}

// figure out mime types for image uploads
switch (defaultConfig.imageUploadType) {
  case 'imgur':
    defaultConfig.allowedUploadMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif'
    ]
    break
  default:
    defaultConfig.allowedUploadMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/svg+xml'
    ]
}

// generate correct path
defaultConfig.sslCAPath.forEach(function (capath, i, array) {
  array[i] = path.resolve(appRootPath, capath)
})

defaultConfig.sslCertPath = path.resolve(appRootPath, defaultConfig.sslCertPath)
defaultConfig.sslKeyPath = path.resolve(appRootPath, defaultConfig.sslKeyPath)
defaultConfig.dhParamPath = path.resolve(appRootPath, defaultConfig.dhParamPath)
defaultConfig.viewPath = path.resolve(appRootPath, defaultConfig.viewPath)
defaultConfig.tmpPath = path.resolve(appRootPath, defaultConfig.tmpPath)
defaultConfig.publicPath = path.resolve(appRootPath, defaultConfig.publicPath)
defaultConfig.defaultNotePath = path.resolve(appRootPath, defaultConfig.defaultNotePath)
defaultConfig.docsPath = path.resolve(appRootPath, defaultConfig.docsPath)
defaultConfig.uploadsPath = path.resolve(appRootPath, defaultConfig.uploadsPath)
defaultConfig.localesPath = path.resolve(appRootPath, defaultConfig.localesPath)

// make config readonly
export const config = deepFreeze(defaultConfig)
