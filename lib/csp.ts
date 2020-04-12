import { config } from './config'
import { IHelmetContentSecurityPolicyDirectives } from 'helmet'
import uuid from 'uuid'
import { NextFunction, Request, Response } from 'express'

type CSPDirectives = IHelmetContentSecurityPolicyDirectives

const defaultDirectives = {
  defaultSrc: ['\'self\''],
  scriptSrc: ['\'self\'', 'vimeo.com', 'https://gist.github.com', 'www.slideshare.net', 'https://query.yahooapis.com', '\'unsafe-eval\''],
  // ^ TODO: Remove unsafe-eval - webpack script-loader issues https://github.com/hackmdio/codimd/issues/594
  imgSrc: ['*'],
  styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://github.githubassets.com'], // unsafe-inline is required for some libs, plus used in views
  fontSrc: ['\'self\'', 'data:', 'https://public.slidesharecdn.com'],
  objectSrc: ['*'], // Chrome PDF viewer treats PDFs as objects :/
  mediaSrc: ['*'],
  childSrc: ['*'],
  connectSrc: ['*']
}

const cdnDirectives = {
  scriptSrc: ['https://cdnjs.cloudflare.com', 'https://cdn.mathjax.org'],
  styleSrc: ['https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
  fontSrc: ['https://cdnjs.cloudflare.com', 'https://fonts.gstatic.com']
}

const disqusDirectives = {
  scriptSrc: ['https://disqus.com', 'https://*.disqus.com', 'https://*.disquscdn.com'],
  styleSrc: ['https://*.disquscdn.com'],
  fontSrc: ['https://*.disquscdn.com']
}

const googleAnalyticsDirectives = {
  scriptSrc: ['https://www.google-analytics.com']
}

function mergeDirectives (existingDirectives: CSPDirectives, newDirectives: CSPDirectives): void {
  for (const propertyName in newDirectives) {
    const newDirective = newDirectives[propertyName]
    if (newDirective) {
      const existingDirective = existingDirectives[propertyName] || []
      existingDirectives[propertyName] = existingDirective.concat(newDirective)
    }
  }
}

function mergeDirectivesIf (condition: boolean, existingDirectives: CSPDirectives, newDirectives: CSPDirectives): void {
  if (condition) {
    mergeDirectives(existingDirectives, newDirectives)
  }
}

function areAllInlineScriptsAllowed (directives: CSPDirectives): boolean {
  if (directives.scriptSrc) {
    return directives.scriptSrc.includes('\'unsafe-inline\'')
  }
  return false
}

function getCspNonce (req: Request, res: Response): string {
  return "'nonce-" + res.locals.nonce + "'"
}

function addInlineScriptExceptions (directives: CSPDirectives): void {
  if (!directives.scriptSrc) {
    directives.scriptSrc = []
  }
  directives.scriptSrc.push(getCspNonce)
  // TODO: This is the SHA-256 hash of the inline script in build/reveal.js/plugins/notes/notes.html
  // Any more clean solution appreciated.
  directives.scriptSrc.push('\'sha256-81acLZNZISnyGYZrSuoYhpzwDTTxi7vC1YM4uNxqWaM=\'')
}

function addUpgradeUnsafeRequestsOptionTo (directives: CSPDirectives): void {
  if (config.csp.upgradeInsecureRequests === 'auto' && config.useSSL) {
    directives.upgradeInsecureRequests = true
  } else if (config.csp.upgradeInsecureRequests === true) {
    directives.upgradeInsecureRequests = true
  }
}

function addReportURI (directives): void {
  if (config.csp.reportURI) {
    directives.reportUri = config.csp.reportURI
  }
}

export function addNonceToLocals (req: Request, res: Response, next: NextFunction): void {
  res.locals.nonce = uuid.v4()
  next()
}

export function computeDirectives (): CSPDirectives {
  const directives: CSPDirectives = {}
  mergeDirectives(directives, config.csp.directives)
  mergeDirectivesIf(config.csp.addDefaults, directives, defaultDirectives)
  mergeDirectivesIf(config.useCDN, directives, cdnDirectives)
  mergeDirectivesIf(config.csp.addDisqus, directives, disqusDirectives)
  mergeDirectivesIf(config.csp.addGoogleAnalytics, directives, googleAnalyticsDirectives)
  if (!areAllInlineScriptsAllowed(directives)) {
    addInlineScriptExceptions(directives)
  }
  addUpgradeUnsafeRequestsOptionTo(directives)
  addReportURI(directives)
  return directives
}
