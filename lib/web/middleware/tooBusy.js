'use strict'

const toobusy = require('toobusy-js')

const errors = require('../../errors')
const config = require('../../config')

toobusy.maxLag(config.tooBusyLag)

module.exports = function (req, res, next) {
  // We dont want to return "toobusy" errors for healthchecks, as that
  // will cause the process to be restarted
  if (req.baseUrl === '/_health') {
    next()
  }
  if (toobusy()) {
    errors.errorServiceUnavailable(res)
  } else {
    next()
  }
}
