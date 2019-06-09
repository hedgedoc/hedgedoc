'use strict'
const config = require('../../config')
const logger = require('../../logger')

const imgur = require('imgur')

exports.uploadImage = function (imagePath, callback) {
  if (!callback || typeof callback !== 'function') {
    logger.error('Callback has to be a function')
    return
  }

  if (!imagePath || typeof imagePath !== 'string') {
    callback(new Error('Image path is missing or wrong'), null)
    return
  }

  imgur.setClientId(config.imgur.clientID)
  imgur.uploadFile(imagePath)
    .then(function (json) {
      logger.debug(`SERVER uploadimage success: ${JSON.stringify(json)}`)
      callback(null, json.data.link.replace(/^http:\/\//i, 'https://'))
    }).catch(function (err) {
      callback(new Error(err), null)
    })
}
