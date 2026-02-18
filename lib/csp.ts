import type { Request, Response, NextFunction } from 'express'
import config = require('./config')
import { v4 as uuidv4 } from 'uuid'
import { buildDomainOriginWithProtocol } from './config/buildDomainOriginWithProtocol'

type CspDirectives = Record<string, any[]>

const defaultDirectives: CspDirectives = {
  defaultSrc: ['\'none\''],
  baseUri: ['\'self\''],
  connectSrc: ['\'self\'', buildDomainOriginWithProtocol(config, 'ws'), 'https://vimeo.com/api/v2/video/'],
  fontSrc: ['\'self\''],
  manifestSrc: ['\'self\''],
  frameSrc: ['\'self\'', 'https://player.vimeo.com', 'https://www.youtube.com', 'https://gist.github.com'],
  imgSrc: ['*', 'data:'], // we allow using arbitrary images & explicit data for mermaid
  scriptSrc: [
    config.serverURL + '/build/',
    config.serverURL + '/js/',
    config.serverURL + '/config',
    '\'unsafe-inline\'' // this is ignored by browsers supporting nonces/hashes
  ],
  styleSrc: [config.serverURL + '/build/', config.serverURL + '/css/', '\'unsafe-inline\''], // unsafe-inline is required for some libs, plus used in views
  objectSrc: ['*'], // Chrome PDF viewer treats PDFs as objects :/
  formAction: ['\'self\''],
  mediaSrc: ['*']
}

const disqusDirectives: CspDirectives = {
  scriptSrc: ['https://disqus.com', 'https://*.disqus.com', 'https://*.disquscdn.com'],
  styleSrc: ['https://*.disquscdn.com'],
  fontSrc: ['https://*.disquscdn.com']
}

const googleAnalyticsDirectives: CspDirectives = {
  scriptSrc: ['https://www.google-analytics.com']
}

const dropboxDirectives: CspDirectives = {
  scriptSrc: ['https://www.dropbox.com', '\'unsafe-inline\'']
}

const disallowFramingDirectives: CspDirectives = {
  frameAncestors: ['\'self\'']
}

const allowPDFEmbedDirectives: CspDirectives = {
  objectSrc: ['*'], // Chrome and Firefox treat PDFs as objects
  frameSrc: ['*'] // Chrome also checks PDFs against frame-src
}

const configuredGitLabInstanceDirectives: CspDirectives = {
  connectSrc: [config.gitlab.baseURL]
}

function mergeDirectives (existingDirectives: CspDirectives, newDirectives: CspDirectives): void {
  for (const propertyName in newDirectives) {
    const newDirective = newDirectives[propertyName]
    if (newDirective) {
      const existingDirective = existingDirectives[propertyName] || []
      existingDirectives[propertyName] = existingDirective.concat(newDirective)
    }
  }
}

function mergeDirectivesIf (condition: any, existingDirectives: CspDirectives, newDirectives: CspDirectives): void {
  if (condition) {
    mergeDirectives(existingDirectives, newDirectives)
  }
}

function getCspNonce (_req: Request, res: Response): string {
  return '\'nonce-' + res.locals.nonce + '\''
}

function addInlineScriptExceptions (directives: CspDirectives): void {
  directives.scriptSrc.push(getCspNonce)
  // TODO: This is the SHA-256 hash of the inline script in build/reveal.js/plugins/notes/notes.html
  // Any more clean solution appreciated.
  directives.scriptSrc.push('\'sha256-81acLZNZISnyGYZrSuoYhpzwDTTxi7vC1YM4uNxqWaM=\'')
}

function addUpgradeUnsafeRequestsOptionTo (directives: CspDirectives): void {
  if (config.csp.upgradeInsecureRequests === 'auto' && (config.useSSL || config.protocolUseSSL)) {
    directives.upgradeInsecureRequests = []
  } else if (config.csp.upgradeInsecureRequests === true) {
    directives.upgradeInsecureRequests = []
  }
}

function addReportURI (directives: CspDirectives): void {
  if (config.csp.reportURI) {
    directives.reportUri = config.csp.reportURI
  }
}

export function computeDirectives (): CspDirectives {
  const directives: CspDirectives = {}
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

export function addNonceToLocals (_req: Request, res: Response, next: NextFunction): void {
  res.locals.nonce = uuidv4()
  next()
}
