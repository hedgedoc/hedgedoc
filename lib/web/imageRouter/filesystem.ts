import path from 'path'
import { URL } from 'url'

import { config } from '../../config'
import { logger } from '../../logger'
import { UploadProvider } from './index'

const FilesystemUploadProvider: UploadProvider = {
  uploadImage: (imagePath, callback) => {
    if (!callback || typeof callback !== 'function') {
      logger.error('Callback has to be a function')
      return
    }

    if (!imagePath) {
      callback(new Error('Image path is missing or wrong'), undefined)
      return
    }

    callback(undefined, (new URL(path.basename(imagePath), config.serverURL + '/uploads/')).href)
  }
}

export { FilesystemUploadProvider }
