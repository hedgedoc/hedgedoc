'use strict'

const toobusy = require('toobusy-js')

const errors = require('../../errors')
const config = require('../../config')

toobusy.maxLag(config.tooBusyLag)

module.exports = function (req, res, next) {
  if (toobusy()) {
    errors.errorServiceUnavailable(res)
  } else {
    next()
  }
}
