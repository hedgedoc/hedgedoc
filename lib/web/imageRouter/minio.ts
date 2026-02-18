'use strict'
import * as fs from 'fs'
import * as path from 'path'

import config = require('../../config')
import { getImageMimeType } from '../../utils'
import logger = require('../../logger')

const Minio = require('minio')
const minioClient = new Minio.Client({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.secure,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey
})

export function uploadImage (imagePath: string, callback: (err: Error | null, url: string | null) => void): void {
  if (!imagePath || typeof imagePath !== 'string') {
    callback(new Error('Image path is missing or wrong'), null)
    return
  }

  if (!callback || typeof callback !== 'function') {
    logger.error('Callback has to be a function')
    return
  }

  fs.readFile(imagePath, function (err: NodeJS.ErrnoException | null, buffer: Buffer) {
    if (err) {
      callback(new Error(String(err)), null)
      return
    }

    const key = path.join('uploads', path.basename(imagePath))
    const protocol = config.minio.secure ? 'https' : 'http'

    minioClient.putObject(config.s3bucket, key, buffer, (buffer as any).size, {
      'Content-Type': getImageMimeType(imagePath) || 'application/octet-stream'
    }, function (err: any, data: any) {
      if (err) {
        callback(new Error(String(err)), null)
        return
      }
      const hidePort = [80, 443].includes(config.minio.port)
      const urlPort = hidePort ? '' : `:${config.minio.port}`
      callback(null, `${protocol}://${config.minio.endPoint}${urlPort}/${config.s3bucket}/${key}`)
    })
  })
}
