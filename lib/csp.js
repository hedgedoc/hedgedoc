const config = require('./config')
const { v4: uuidv4 } = require('uuid')
const { buildDomainOriginWithProtocol } = require('./config/buildDomainOriginWithProtocol')

const CspStrategy = {}

const defaultDirectives = {
  defaultSrc: ['\'none\''],
  baseUri: ['\'self\''],
  connectSrc: ['\'self\'', buildDomainOriginWithProtocol(config, 'ws')],
  fontSrc: ['\'self\''],
  manifestSrc: ['\'self\''],
  frameSrc: ['\'self\'', 'https://player.vimeo.com', 'https://www.slideshare.net/slideshow/embed_code/key/', 'https://www.youtube.com'],
  imgSrc: ['*', 'data:'], // we allow using arbitrary images & explicit data for mermaid
  scriptSrc: [
    config.serverURL + '/build/',
    config.serverURL + '/js/',
    config.serverURL + '/config',
    'https://gist.github.com/',
    'https://vimeo.com/api/oembed.json',
    'https://www.slideshare.net/api/oembed/2',
    '\'unsafe-inline\'' // this is ignored by browsers supporting nonces/hashes
  ],
  styleSrc: [config.serverURL + '/build/', config.serverURL + '/css/', '\'unsafe-inline\'', 'https://github.githubassets.com'], // unsafe-inline is required for some libs, plus used in views
  objectSrc: ['*'], // Chrome PDF viewer treats PDFs as objects :/
  formAction: ['\'self\''],
  mediaSrc: ['*']
}

const disqusDirectives = {
  scriptSrc: ['https://disqus.com', 'https://*.disqus.com', 'https://*.disquscdn.com'],
  styleSrc: ['https://*.disquscdn.com'],
  fontSrc: ['https://*.disquscdn.com']
}

const googleAnalyticsDirectives = {
  scriptSrc: ['https://www.google-analytics.com']
}

const dropboxDirectives = {
  scriptSrc: ['https://www.dropbox.com', '\'unsafe-inline\'']
}

const disallowFramingDirectives = {
  frameAncestors: ['\'self\'']
}

const allowPDFEmbedDirectives = {
  objectSrc: ['*'], // Chrome and Firefox treat PDFs as objects
  frameSrc: ['*'] // Chrome also checks PDFs against frame-src
}

const configuredGitLabInstanceDirectives = {
  connectSrc: [config.gitlab.baseURL]
}

CspStrategy.computeDirectives = function () {
  const directives = {}
  mergeDirectives(directives, config.csp.directives)
  mergeDirectivesIf(config.csp.addDefaults, directives, defaultDirectives)
  mergeDirectivesIf(config.csp.addDisqus, directives, disqusDirectives)
  mergeDirectivesIf(config.csp.addGoogleAnalytics, directives, googleAnalyticsDirectives)
  mergeDirectivesIf(config.dropbox.appKey, directives, dropboxDirectives)
  mergeDirectivesIf(!config.csp.allowFraming, directives, disallowFramingDirectives)
  mergeDirectivesIf(config.csp.allowPDFEmbed, directives, allowPDFEmbedDirectives)
  mergeDirectivesIf(config.isGitlabSnippetsEnable, directives, configuredGitLabInstanceDirectives)
  addInlineScriptExceptions(directives)
  addUpgradeUnsafeRequestsOptionTo(directives)
  addReportURI(directives)
  return directives
}

function mergeDirectives (existingDirectives, newDirectives) {
  for (const propertyName in newDirectives) {
    const newDirective = newDirectives[propertyName]
    if (newDirective) {
      const existingDirective = existingDirectives[propertyName] || []
      existingDirectives[propertyName] = existingDirective.concat(newDirective)
    }
  }
}

function mergeDirectivesIf (condition, existingDirectives, newDirectives) {
  if (condition) {
    mergeDirectives(existingDirectives, newDirectives)
  }
}

function addInlineScriptExceptions (directives) {
  directives.scriptSrc.push(getCspNonce)
  // TODO: This is the SHA-256 hash of the inline script in build/reveal.js/plugins/notes/notes.html
  // Any more clean solution appreciated.
  directives.scriptSrc.push('\'sha256-81acLZNZISnyGYZrSuoYhpzwDTTxi7vC1YM4uNxqWaM=\'')
}

function getCspNonce (req, res) {
  return '\'nonce-' + res.locals.nonce + '\''
}

function addUpgradeUnsafeRequestsOptionTo (directives) {
  if (config.csp.upgradeInsecureRequests === 'auto' && (config.useSSL || config.protocolUseSSL)) {
    directives.upgradeInsecureRequests = []
  } else if (config.csp.upgradeInsecureRequests === true) {
    directives.upgradeInsecureRequests = []
  }
}

function addReportURI (directives) {
  if (config.csp.reportURI) {
    directives.reportUri = config.csp.reportURI
  }
}

CspStrategy.addNonceToLocals = function (req, res, next) {
  res.locals.nonce = uuidv4()
  next()
}

module.exports = CspStrategy
