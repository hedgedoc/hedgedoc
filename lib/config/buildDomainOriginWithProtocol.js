module.exports = {
  buildDomainOriginWithProtocol: function (config, baseProtocol) {
    const isStandardHTTPsPort = config.protocolUseSSL && config.port === 443
    const isStandardHTTPPort = !config.protocolUseSSL && config.port === 80

    if (!config.domain) {
      return ''
    }
    let origin = ''
    const protocol = baseProtocol + (config.protocolUseSSL ? 's' : '') + '://'
    origin = protocol + config.domain
    if (config.urlAddPort) {
      if (!isStandardHTTPPort || !isStandardHTTPsPort) {
        origin += ':' + config.port
      }
    }
    return origin
  }
}
