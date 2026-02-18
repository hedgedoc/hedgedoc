interface DomainConfig {
  protocolUseSSL: boolean
  port: number
  domain: string
  urlAddPort: boolean
}

export function buildDomainOriginWithProtocol (config: DomainConfig, baseProtocol: string): string {
  const isStandardHTTPsPort = config.protocolUseSSL && config.port === 443
  const isStandardHTTPPort = !config.protocolUseSSL && config.port === 80

  if (!config.domain) {
    return ''
  }
  const protocol = baseProtocol + (config.protocolUseSSL ? 's' : '') + '://'
  let origin = protocol + config.domain
  if (config.urlAddPort) {
    // BUG FIX: was `!isStandardHTTPPort || !isStandardHTTPsPort` which is always true
    // (one of the two is always false). Should be AND to skip port for either standard port.
    if (!isStandardHTTPPort && !isStandardHTTPsPort) {
      origin += ':' + config.port
    }
  }
  return origin
}
