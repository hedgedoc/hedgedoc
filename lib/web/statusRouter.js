'use strict'

const Router = require('express').Router

const errors = require('../errors')
const realtime = require('../realtime')
const config = require('../config')

const statusRouter = module.exports = Router()

statusRouter.get('/_health', function (req, res) {
  res.set({
    'Cache-Control': 'private', // only cache by client
    'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
  })
  res.send({
    ready: !realtime.maintenance
  })
})

// get status
statusRouter.get('/status', function (req, res, next) {
  if (!config.enableStatsApi) {
    return errors.errorForbidden(res)
  }
  realtime.getStatus(function (data) {
    res.set({
      'Cache-Control': 'private', // only cache by client
      'X-Robots-Tag': 'noindex, nofollow', // prevent crawling
      'Content-Type': 'application/json'
    })
    res.send(data)
  })
})

statusRouter.get('/config', function (req, res) {
  const data = {
    domain: config.domain,
    urlpath: config.urlPath,
    debug: config.debug,
    version: config.fullversion,
    DROPBOX_APP_KEY: config.dropbox.appKey,
    allowedUploadMimeTypes: config.allowedUploadMimeTypes,
    linkifyHeaderStyle: config.linkifyHeaderStyle,
    cookiePolicy: config.cookiePolicy,
    enableUploads: config.enableUploads,
    userToken: req.user ? req.user.deleteToken : ''
  }
  res.set({
    'Cache-Control': 'private', // only cache by client
    'X-Robots-Tag': 'noindex, nofollow', // prevent crawling
    'Content-Type': 'application/javascript'
  })
  res.render('../js/lib/common/constant.ejs', data)
})
