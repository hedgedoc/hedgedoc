
'use strict'

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { merge } = require('lodash')
const deepFreeze = require('deep-freeze')
const { Environment, Permission } = require('./enum')
const logger = require('../logger')
const { getGitCommit, getGitHubURL, toBooleanConfig } = require('./utils')

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

let config = require('./convict')
config.load(debugConfig)
config.load(packageConfig)
config.load(fileConfig)
config.load(require('./dockerSecret'))

if (['debug', 'verbose', 'info', 'warn', 'error'].includes(config.get('loglevel'))) {
  logger.level = config.loglevel
} else {
  logger.error('Selected loglevel %s doesn\'t exist, using default level \'debug\'. Available options: debug, verbose, info, warn, error', config.loglevel)
}

// load LDAP CA
if (config.get('ldap').tlsca) {
  let ca = config.ldap.tlsca.split(',')
  let caContent = []
  for (let i of ca) {
    if (fs.existsSync(i)) {
      caContent.push(fs.readFileSync(i, 'utf8'))
    }
  }
  let tlsOptions = {
    ca: caContent
  }
  config.load({
    ldap: {
      tlsOptions: config.get(ldap).tlsOptions ? Object.assign(config.get('ldap').tlsOptions, tlsOptions) : tlsOptions
    }
  })
}

// Permission
let permissions = Permission
if (!config.allowAnonymous && !config.allowAnonymousEdits) {
  delete permissions.freely
}
if (!(config.defaultPermission in permissions)) {
  config.load({defaultPermission: permissions.editable})
}

config.load({permission: permissions})

// cache serverURL
config.load({
  serverURL: (function getserverurl () {
    const isStandardHTTPsPort = config.get('useSSL') && config.get('port') === 443
    const isStandardHTTPPort = config.get('useSSL') && config.get('port') === 80
    let url = ''
    if (config.get('domain')) {
      const protocol = config.get('protocolUseSSL') ? 'https://' : 'http://'
      url = protocol + config.get('domain')
      if (config.get('urlAddPort')) {
        if (!isStandardHTTPPort || !isStandardHTTPsPort) {
          url += ':' + config.get('port')
        }
      }
    }
    if (config.get('urlPath') !== '') {
      url += '/' + config.get('urlPath')
    }
    return url
  })()
})

if (config.serverURL === '') {
  logger.warn('Neither \'domain\' nor \'CMD_DOMAIN\' is configured. This can cause issues with various components.\nHint: Make sure \'protocolUseSSL\' and \'urlAddPort\' or \'CMD_PROTOCOL_USESSL\' and \'CMD_URL_ADDPORT\' are configured properly.')
}

logger.debug(typeof config.get('facebook.clientID') && config.get('facebook.clientSecret'))

// auth method
config.load({
  isFacebookEnable: toBooleanConfig(config.get('facebook.clientID') && config.get('facebook.clientSecret')),
  isGoogleEnable: toBooleanConfig(config.get('google.clientID') && config.get('google.clientSecret')),
  isDropboxEnable: toBooleanConfig(config.get('dropbox.clientID') && config.get('dropbox.clientSecret')),
  isTwitterEnable: toBooleanConfig(config.get('twitter.consumerKey') && config.get('twitter.consumerSecret')),
  isEmailEnable: toBooleanConfig(config.get('email')),
  isOpenIDEnable: toBooleanConfig(config.get('openID')),
  isGitHubEnable: toBooleanConfig(config.get('github.clientID') && config.get('github.clientSecret')),
  isGitLabEnable: toBooleanConfig(config.get('gitlab.clientID') && config.get('gitlab.clientSecret')),
  isMattermostEnable: toBooleanConfig(config.get('mattermost.clientID') && config.get('mattermost.clientSecret')),
  isLDAPEnable: toBooleanConfig(config.get('ldap.url')),
  isSAMLEnable: toBooleanConfig(config.get('saml.idpSsoUrl')),
  isOAuth2Enable: toBooleanConfig(config.get('oauth2.clientID') && config.get('oauth2.clientSecret')),
  isPDFExportEnable: toBooleanConfig(config.get('allowPDFExport'))
})


// If gitlab scope is api, enable snippets Export/import
config.load({isGitlabSnippetsEnable: toBooleanConfig(!config.get('gitlab').scope || config.get('gitlab').scope === 'api') && config.get('isGitLabEnable')})

// Only update i18n files in development setups
config.load({updateI18nFiles: (env === Environment.development)})

// merge legacy values
let keys = Object.keys(config)
const uppercase = /[A-Z]/
for (let i = keys.length; i--;) {
  let lowercaseKey = keys[i].toLowerCase()
  // if the config contains uppercase letters
  // and a lowercase version of this setting exists
  // and the config with uppercase is not set
  // we set the new config using the old key.
  if (uppercase.test(keys[i]) &&
  config[lowercaseKey] !== undefined &&
  fileConfig[keys[i]] === undefined) {
    logger.warn('config.js contains deprecated lowercase setting for ' + keys[i] + '. Please change your config.js file to replace ' + lowercaseKey + ' with ' + keys[i])
    config[keys[i]] = config[lowercaseKey]
  }
}

// Generate session secret if it stays on default values
if (config.sessionSecret === 'secret') {
  logger.warn('Session secret not set. Using random generated one. Please set `sessionSecret` in your config.js file. All users will be logged out.')
  let sessionSecret = crypto.randomBytes(Math.ceil(config.sessionSecretLen / 2)) // generate crypto graphic random number
    .toString('hex') // convert to hexadecimal format
    .slice(0, config.sessionSecretLen) // return required number of characters
  config.load({sessionSecret: sessionSecret})
}

// figure out mime types for image uploads
switch (config.get('imageUploadType')) {
  case 'imgur':
    config.load({allowedUploadMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif'
    ]})
    break
  default:
    config.load({allowedUploadMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/gif',
      'image/svg+xml'
    ]})
}

// Disable PDF export due to security issue
if (config.get('allowPDFExport')) {
  config.load({allowPDFExport: false})
  logger.warn('PDF export was disabled for this release to mitigate a critical security issue. This feature will hopefully become available again in future releases.')
}

// generate correct path
// config.sslCAPath.forEach(function (capath, i, array) {
//   array[i] = path.resolve(appRootPath, capath)
// })
//
// config.sslCertPath = path.resolve(appRootPath, config.sslCertPath)
// config.sslKeyPath = path.resolve(appRootPath, config.sslKeyPath)
// config.dhParamPath = path.resolve(appRootPath, config.dhParamPath)
// config.viewPath = path.resolve(appRootPath, config.viewPath)
// config.tmpPath = path.resolve(appRootPath, config.tmpPath)
// config.defaultNotePath = path.resolve(appRootPath, config.defaultNotePath)
// config.docsPath = path.resolve(appRootPath, config.docsPath)
// config.uploadsPath = path.resolve(appRootPath, config.uploadsPath)

// make config readonly
//config = deepFreeze(config)
config.validate({allowed: 'warn', output: logger.warn})
module.exports = config
