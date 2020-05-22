import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'

import { config } from '../../config'
// import { getImageMimeType } from '../../utils'
import { logger } from '../../logger'
import { UploadProvider } from './index'

const awsConfig = new AWS.Config(config.s3)
const s3 = new AWS.S3(awsConfig)

const S3UploadProvider: UploadProvider = {
  uploadImage: (imagePath, callback) => {
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
      const params = {
        Bucket: config.s3bucket,
        Key: path.join('uploads', path.basename(imagePath)),
        Body: buffer
      }

      // ToDo: This does not exist (anymore?)
      // const mimeType = getImageMimeType(imagePath)
      // if (mimeType) { params.ContentType = mimeType }

      logger.debug(`S3 object parameters: ${JSON.stringify(params)}`)
      s3.putObject(params, function (err, _) {
        if (err) {
          callback(new Error(err.message), undefined)
          return
        }

        let s3Endpoint = 's3.amazonaws.com'
        if (config.s3.endpoint) {
          s3Endpoint = config.s3.endpoint
        } else if (config.s3.region && config.s3.region !== 'us-east-1') {
          s3Endpoint = `s3-${config.s3.region}.amazonaws.com`
        }
        callback(undefined, `https://${s3Endpoint}/${config.s3bucket}/${params.Key}`)
      })
    })
  }
}

export { S3UploadProvider }
