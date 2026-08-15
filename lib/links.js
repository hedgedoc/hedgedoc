module.exports = {
  serveLinkWarningPage: function (req, res) {
    let targetURL = typeof req.query.url === 'string' ? req.query.url : ''
    let valid = false
    try {
      targetURL = decodeURIComponent(targetURL)
      const parsed = new URL(targetURL)
      valid = ['http:', 'https:'].includes(parsed.protocol)
      targetURL = parsed.href
    } catch (err) {
      valid = false
    }
    res.set({
      'Cache-Control': 'no-store'
    })
    res.render('link.ejs', {
      title: 'External link',
      valid,
      targetURL,
      cspNonce: res.locals.nonce,
      opengraph: []
    })
  }
}
