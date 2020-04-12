import imgur from 'imgur'

import { config } from '../../config'
import { logger } from '../../logger'
import { UploadProvider } from './index'

const ImgurUploadProvider: UploadProvider = {
  uploadImage: (imagePath, callback) => {
    if (!callback || typeof callback !== 'function') {
      logger.error('Callback has to be a function')
      return
    }

    if (!imagePath) {
      callback(new Error('Image path is missing or wrong'), undefined)
      return
    }

    imgur.setClientId(config.imgur.clientID)
    imgur.uploadFile(imagePath)
      .then(function (json) {
        logger.debug(`SERVER uploadimage success: ${JSON.stringify(json)}`)
        callback(undefined, json.data.link.replace(/^http:\/\//i, 'https://'))
      }).catch(function (err) {
        callback(new Error(err), undefined)
      })
  }
}

export { ImgurUploadProvider }
