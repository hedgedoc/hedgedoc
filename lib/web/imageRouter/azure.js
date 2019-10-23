'use strict'
const path = require('path')

const config = require('../../config')
const logger = require('../../logger')

const azure = require('azure-storage')

exports.uploadImage = function (imagePath, callback) {
  if (!callback || typeof callback !== 'function') {
    logger.error('Callback has to be a function')
    return
  }

  if (!imagePath || typeof imagePath !== 'string') {
    callback(new Error('Image path is missing or wrong'), null)
    return
  }

  var azureBlobService = azure.createBlobService(config.get('azure').connectionString)

  azureBlobService.createContainerIfNotExists(config.get('azure').container, { publicAccessLevel: 'blob' }, function (err, result, response) {
    if (err) {
      callback(new Error(err.message), null)
    } else {
      azureBlobService.createBlockBlobFromLocalFile(config.get('azure').container, path.basename(imagePath), imagePath, function (err, result, response) {
        if (err) {
          callback(new Error(err.message), null)
        } else {
          callback(null, azureBlobService.getUrl(config.get('azure').container, result.name))
        }
      })
    }
  })
}
