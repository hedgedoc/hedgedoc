import azure from 'azure-storage'
import path from 'path'

import { config } from '../../config'
import { logger } from '../../logger'
import { UploadProvider } from './index'

const AzureUploadProvider: UploadProvider = {
  uploadImage: (imagePath, callback) => {
    if (!callback || typeof callback !== 'function') {
      logger.error('Callback has to be a function')
      return
    }

    if (!imagePath) {
      callback(new Error('Image path is missing or wrong'), undefined)
      return
    }

    const azureBlobService = azure.createBlobService(config.azure.connectionString)

    azureBlobService.createContainerIfNotExists(config.azure.container, { publicAccessLevel: 'blob' }, function (err, _, __) {
      if (err) {
        callback(new Error(err.message), undefined)
      } else {
        azureBlobService.createBlockBlobFromLocalFile(config.azure.container, path.basename(imagePath), imagePath, function (err, result, _) {
          if (err) {
            callback(new Error(err.message), undefined)
          } else {
            callback(undefined, azureBlobService.getUrl(config.azure.container, result.name))
          }
        })
      }
    })
  }
}

export { AzureUploadProvider }
