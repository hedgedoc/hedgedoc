const config = require('./config')

module.exports = {
  errorForbidden: function (res) {
    const { req } = res
    if (req.user) {
      responseError(res, '403', 'Forbidden', 'oh no.')
    } else {
      if (!req.session) req.session = {}
      req.session.returnTo = req.originalUrl || config.serverUrl + '/'
      req.flash('error', 'You are not allowed to access this page. Maybe try logging in?')
      res.redirect(config.serverURL + '/')
    }
  },
  errorNotFound: function (res) {
    responseError(res, '404', 'Not Found', 'oops.')
  },
  errorBadRequest: function (res) {
    responseError(res, '400', 'Bad Request', 'something not right.')
  },
  errorTooLong: function (res) {
    responseError(res, '413', 'Payload Too Large', 'Shorten your note!')
  },
  errorInternalError: function (res) {
    responseError(res, '500', 'Internal Error', 'wtf.')
  },
  errorServiceUnavailable: function (res) {
    res.status(503).send('I\'m busy right now, try again later.')
  }
}

function responseError (res, code, detail, msg) {
  res.status(code).render('error.ejs', {
    title: code + ' ' + detail + ' ' + msg,
    code: code,
    detail: detail,
    msg: msg,
    opengraph: []
  })
}
