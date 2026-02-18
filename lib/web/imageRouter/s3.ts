'use strict'
import * as fs from 'fs'
import * as path from 'path'

import config = require('../../config')
import { getImageMimeType } from '../../utils'
import logger = require('../../logger')

const AWS = require('aws-sdk')
const awsConfig = new AWS.Config(config.s3)
const s3 = new AWS.S3(awsConfig)

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
    const params: any = {
      Bucket: config.s3bucket,
      Key: path.join(config.s3folder, path.basename(imagePath)),
      Body: buffer
    }

    const mimeType = getImageMimeType(imagePath)
    if (mimeType) { params.ContentType = mimeType }
    if (config.s3publicFiles) { params.ACL = 'public-read' }

    logger.debug(`S3 object parameters: ${JSON.stringify(params)}`)
    s3.putObject(params, function (err: any, data: any) {
      if (err) {
        callback(new Error(String(err)), null)
        return
      }

      let s3Endpoint = 's3.amazonaws.com'
      if (config.s3.endpoint) {
        s3Endpoint = config.s3.endpoint
      } else if (config.s3.region && config.s3.region !== 'us-east-1') {
        s3Endpoint = `s3.${config.s3.region}.amazonaws.com`
      }
      callback(null, `https://${s3Endpoint}/${config.s3bucket}/${params.Key}`)
    })
  })
}
