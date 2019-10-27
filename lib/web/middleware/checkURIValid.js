'use strict'

const logger = require('../../logger')
const errors = require('../../errors')

module.exports = function (req, res, next) {
  try {
    decodeURIComponent(req.path)
  } catch (err) {
    logger.error(err)
    return errors.errorBadRequest(res)
  }
  next()
}
