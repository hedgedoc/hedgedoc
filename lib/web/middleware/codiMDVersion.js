'use strict'

const config = require('../../config')

module.exports = function (req, res, next) {
  res.set({
    'HedgeDoc-Version': config.version
  })
  return next()
}
