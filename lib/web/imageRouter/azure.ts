'use strict'
import * as path from 'path'

import config = require('../../config')
import logger = require('../../logger')

const azure = require('azure-storage')

export function uploadImage (imagePath: string, callback: (err: Error | null, url: string | null) => void): void {
  if (!callback || typeof callback !== 'function') {
    logger.error('Callback has to be a function')
    return
  }

  if (!imagePath || typeof imagePath !== 'string') {
    callback(new Error('Image path is missing or wrong'), null)
    return
  }

  const azureBlobService = azure.createBlobService(config.azure.connectionString)

  azureBlobService.createContainerIfNotExists(config.azure.container, { publicAccessLevel: 'blob' }, function (err: any, result: any, response: any) {
    if (err) {
      callback(new Error(err.message), null)
    } else {
      azureBlobService.createBlockBlobFromLocalFile(config.azure.container, path.basename(imagePath), imagePath, function (err: any, result: any, response: any) {
        if (err) {
          callback(new Error(err.message), null)
        } else {
          callback(null, azureBlobService.getUrl(config.azure.container, result.name))
        }
      })
    }
  })
}
