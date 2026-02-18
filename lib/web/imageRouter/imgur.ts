'use strict'
import config = require('../../config')
import logger = require('../../logger')
import * as fs from 'fs'

export function uploadImage (imagePath: string, callback: (err: Error | null, url: string | null) => void): void {
  if (!callback || typeof callback !== 'function') {
    logger.error('Callback has to be a function')
    return
  }

  if (!imagePath || typeof imagePath !== 'string') {
    callback(new Error('Image path is missing or wrong'), null)
    return
  }

  // The following client ID is for use with HedgeDoc only
  const clientId = config.imgur.clientID || '032aa2f687790cd'

  const buffer = fs.readFileSync(imagePath)

  const params = new URLSearchParams()
  params.append('image', buffer.toString('base64'))
  params.append('type', 'base64')
  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    body: params,
    headers: { Authorization: `Client-ID ${clientId}` }
  })
    .then((res) => {
      if (!res.ok) {
        callback(new Error(res.statusText), null)
        return
      }
      return res.json()
    })
    .then((json: any) => {
      logger.debug(`SERVER uploadimage success: ${JSON.stringify(json)}`)
      callback(null, json.data.link.replace(/^http:\/\//i, 'https://'))
    }).catch((err: any) => {
      callback(new Error(err), null)
    })
}
