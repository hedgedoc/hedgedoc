'use strict'
const fs = require('fs')
const path = require('path')

const config = require('../../config')
const { getImageMimeType } = require('../../utils')
const logger = require('../../logger')

const Minio = require('minio')
const minioClient = new Minio.Client({
  endPoint: config.get('minio').endPoint,
  port: config.get('minio').port,
  secure: config.get('minio').secure,
  accessKey: config.get('minio').accessKey,
  secretKey: config.get('minio').secretKey
})

exports.uploadImage = function (imagePath, callback) {
  if (!imagePath || typeof imagePath !== 'string') {
    callback(new Error('Image path is missing or wrong'), null)
    return
  }

  if (!callback || typeof callback !== 'function') {
    logger.error('Callback has to be a function')
    return
  }

  fs.readFile(imagePath, function (err, buffer) {
    if (err) {
      callback(new Error(err), null)
      return
    }

    let key = path.join('uploads', path.basename(imagePath))
    let protocol = config.get('minio').secure ? 'https' : 'http'

    minioClient.putObject(config.get('s3bucket'), key, buffer, buffer.size, getImageMimeType(imagePath), function (err, data) {
      if (err) {
        callback(new Error(err), null)
        return
      }
      let hidePort = [80, 443].includes(config.get('minio').port)
      let urlPort = hidePort ? '' : `:${config.get('minio').port}`
      callback(null, `${protocol}://${config.get('minio').endPoint}${urlPort}/${config.get('s3bucket}/${key}`'))
    })
  })
}
