const config = require('./config')

function responseError (res, code: number, detail: string, msg: string): void {
  res.status(code).render('error.ejs', {
    title: code + ' ' + detail + ' ' + msg,
    code: code,
    detail: detail,
    msg: msg,
    opengraph: []
  })
}

function errorForbidden (res): void {
  const { req } = res
  if (req.user) {
    responseError(res, 403, 'Forbidden', 'oh no.')
  } else {
    if (!req.session) req.session = {}
    req.session.returnTo = req.originalUrl || config.serverUrl + '/'
    req.flash('error', 'You are not allowed to access this page. Maybe try logging in?')
    res.redirect(config.serverURL + '/')
  }
}

function errorNotFound (res): void {
  responseError(res, 404, 'Not Found', 'oops.')
}

function errorBadRequest (res): void {
  responseError(res, 400, 'Bad Request', 'something not right.')
}

function errorTooLong (res): void {
  responseError(res, 413, 'Payload Too Large', 'Shorten your note!')
}

function errorInternalError (res): void {
  responseError(res, 500, 'Internal Error', 'wtf.')
}

function errorServiceUnavailable (res): void {
  responseError(res, 503, 'Service Unvavilable', 'I\'m busy right now, try again later.')
}

const errors = {
  errorForbidden: errorForbidden,
  errorNotFound: errorNotFound,
  errorBadRequest: errorBadRequest,
  errorTooLong: errorTooLong,
  errorInternalError: errorInternalError,
  errorServiceUnavailable: errorServiceUnavailable
}

export { errors }
