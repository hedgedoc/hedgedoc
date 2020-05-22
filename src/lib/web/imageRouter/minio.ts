import path from 'path'
import fs from 'fs'
import { Client } from 'minio'

import { config } from '../../config'
import { getImageMimeType } from '../../utils'
import { logger } from '../../logger'
import { UploadProvider } from './index'

let MinioUploadProvider: UploadProvider

if (config.minio.endPoint !== undefined) {
  const minioClient = new Client({
    endPoint: config.minio.endPoint,
    port: config.minio.port,
    useSSL: config.minio.secure,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey
  })

  MinioUploadProvider = {
    uploadImage: (imagePath, callback): void => {
      if (!imagePath) {
        callback(new Error('Image path is missing or wrong'), undefined)
        return
      }

      if (!callback || typeof callback !== 'function') {
        logger.error('Callback has to be a function')
        return
      }

      fs.readFile(imagePath, function (err, buffer) {
        if (err) {
          callback(new Error(err.message), undefined)
          return
        }

        const key = path.join('uploads', path.basename(imagePath))
        const protocol = config.minio.secure ? 'https' : 'http'

        const metaData = {
          ContentType: getImageMimeType(imagePath)
        }

        minioClient.putObject(config.s3bucket, key, buffer, buffer.length, metaData, function (err, _) {
          if (err) {
            callback(new Error(err.message), undefined)
            return
          }
          const hidePort = [80, 443].includes(config.minio.port)
          const urlPort = hidePort ? '' : `:${config.minio.port}`
          callback(undefined, `${protocol}://${config.minio.endPoint}${urlPort}/${config.s3bucket}/${key}`)
        })
      })
    }
  }
}

export { MinioUploadProvider }
