'use strict'

const Router = require('express').Router

const errors = require('../errors')
const realtime = require('../realtime')
const config = require('../config')
const models = require('../models')
const logger = require('../logger')

const { urlencodedParser } = require('./utils')

const statusRouter = module.exports = Router()

// get status
statusRouter.get('/status', function (req, res, next) {
  realtime.getStatus(function (data) {
    res.set({
      'Cache-Control': 'private', // only cache by client
      'X-Robots-Tag': 'noindex, nofollow', // prevent crawling
      'Content-Type': 'application/json'
    })
    res.send(data)
  })
})
// get status
statusRouter.get('/temp', function (req, res) {
  var host = req.get('host')
  if (config.allowOrigin.indexOf(host) === -1) {
    errors.errorForbidden(res)
  } else {
    var tempid = req.query.tempid
    if (!tempid) {
      errors.errorForbidden(res)
    } else {
      models.Temp.findOne({
        where: {
          id: tempid
        }
      }).then(function (temp) {
        if (!temp) {
          errors.errorNotFound(res)
        } else {
          res.header('Access-Control-Allow-Origin', '*')
          res.send({
            temp: temp.data
          })
          temp.destroy().catch(function (err) {
            if (err) {
              logger.error('remove temp failed: ' + err)
            }
          })
        }
      }).catch(function (err) {
        logger.error(err)
        return errors.errorInternalError(res)
      })
    }
  }
})
// post status
statusRouter.post('/temp', urlencodedParser, function (req, res) {
  var host = req.get('host')
  if (config.allowOrigin.indexOf(host) === -1) {
    errors.errorForbidden(res)
  } else {
    var data = req.body.data
    if (!data) {
      errors.errorForbidden(res)
    } else {
      logger.debug(`SERVER received temp from [${host}]: ${req.body.data}`)
      models.Temp.create({
        data: data
      }).then(function (temp) {
        if (temp) {
          res.header('Access-Control-Allow-Origin', '*')
          res.send({
            status: 'ok',
            id: temp.id
          })
        } else {
          errors.errorInternalError(res)
        }
      }).catch(function (err) {
        logger.error(err)
        return errors.errorInternalError(res)
      })
    }
  }
})

statusRouter.get('/config', function (req, res) {
  var data = {
    domain: config.domain,
    urlpath: config.urlPath,
    debug: config.debug,
    version: config.fullversion,
    DROPBOX_APP_KEY: config.dropbox.appKey,
    allowedUploadMimeTypes: config.allowedUploadMimeTypes,
    linkifyHeaderStyle: config.linkifyHeaderStyle
  }
  res.set({
    'Cache-Control': 'private', // only cache by client
    'X-Robots-Tag': 'noindex, nofollow', // prevent crawling
    'Content-Type': 'application/javascript'
  })
  res.render('../js/lib/common/constant.ejs', data)
})
