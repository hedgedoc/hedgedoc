'use strict'
import { URL } from 'url'
import * as path from 'path'
import * as fs from 'fs'

import config = require('../../config')
import logger = require('../../logger')

export function uploadImage (imagePath: string, callback: (err: Error | null, url: string | null) => void): void {
  if (!callback || typeof callback !== 'function') {
    logger.error('Callback has to be a function')
    return
  }

  if (!imagePath || typeof imagePath !== 'string') {
    callback(new Error('Image path is missing or wrong'), null)
    return
  }

  const fileName = path.basename(imagePath)
  // move image from temporary path to upload directory
  try {
    fs.copyFileSync(imagePath, path.join(config.uploadsPath, fileName))
  } catch (e: any) {
    callback(new Error(`Error while moving file: ${e.message}`), null)
    return
  }
  callback(null, (new URL(fileName, config.serverURL + '/uploads/')).href)
}
