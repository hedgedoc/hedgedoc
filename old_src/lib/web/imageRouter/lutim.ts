import lutim from 'old_src/lib/web/imageRouter/lutim'

import { config } from '../../config'
import { logger } from '../../logger'
import { UploadProvider } from './index'

const LutimUploadProvider: UploadProvider = {
  uploadImage: (imagePath, callback) => {
    if (!callback || typeof callback !== 'function') {
      logger.error('Callback has to be a function')
      return
    }

    if (!imagePath) {
      callback(new Error('Image path is missing or wrong'), undefined)
      return
    }

    if (config.lutim && config.lutim.url) {
      lutim.setAPIUrl(config.lutim.url)
      logger.debug(`Set lutim URL to ${lutim.getAPIUrl()}`)
    }

    lutim.uploadImage(imagePath)
      .then(function (json) {
        logger.debug(`SERVER uploadimage success: ${JSON.stringify(json)}`)
        callback(undefined, lutim.getAPIUrl() + json.msg.short)
      }).catch(function (err) {
        callback(new Error(err), undefined)
      })
  }
}

export { LutimUploadProvider }
