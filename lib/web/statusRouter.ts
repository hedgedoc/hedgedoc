'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import * as errors from '../errors'
import realtime = require('../realtime')
import config = require('../config')
import models = require('../models')
import logger = require('../logger')
import { urlencodedParser } from './utils'

const statusRouter = Router()

// get status
statusRouter.get('/_health', function (_req: Request, res: Response) {
  res.set({
    'Cache-Control': 'private', // only cache by client
    'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
  })
  res.send({
    ready: !realtime.maintenance
  })
})

// get status
statusRouter.get('/status', function (req: Request, res: Response, _next: NextFunction) {
  if (!config.enableStatsApi) {
    return errors.errorForbidden(res)
  }
  realtime.getStatus(function (data: Record<string, unknown>) {
    res.set({
      'Cache-Control': 'private', // only cache by client
      'X-Robots-Tag': 'noindex, nofollow', // prevent crawling
      'Content-Type': 'application/json'
    })
    res.send(data)
  })
})

statusRouter.get('/temp', function (req: Request, res: Response) {
  const host = req.get('host')
  if (config.allowOrigin.indexOf(host) === -1) {
    errors.errorForbidden(res)
  } else {
    const tempid = req.query.tempid
    if (!tempid) {
      errors.errorForbidden(res)
    } else {
      models.Temp.findOne({
        where: {
          id: tempid
        }
      }).then(function (temp: any) {
        if (!temp) {
          errors.errorNotFound(res)
        } else {
          res.header('Access-Control-Allow-Origin', '*')
          res.send({
            temp: temp.data
          })
          temp.destroy().catch(function (err: Error) {
            if (err) {
              logger.error('remove temp failed: ' + err)
            }
          })
        }
      }).catch(function (err: Error) {
        logger.error(err)
        return errors.errorInternalError(res)
      })
    }
  }
})

// post status
statusRouter.post('/temp', urlencodedParser, function (req: Request, res: Response) {
  const host = req.get('host')
  if (config.allowOrigin.indexOf(host) === -1) {
    errors.errorForbidden(res)
  } else {
    const data = req.body.data
    if (!data) {
      errors.errorForbidden(res)
    } else {
      logger.debug(`SERVER received temp from [${host}]: ${req.body.data}`)
      models.Temp.create({
        data
      }).then(function (temp: any) {
        if (temp) {
          res.header('Access-Control-Allow-Origin', '*')
          res.send({
            status: 'ok',
            id: temp.id
          })
        } else {
          errors.errorInternalError(res)
        }
      }).catch(function (err: Error) {
        logger.error(err)
        return errors.errorInternalError(res)
      })
    }
  }
})

statusRouter.get('/config', function (req: Request, res: Response) {
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
    userToken: (req as any).user ? (req as any).user.deleteToken : ''
  }
  res.set({
    'Cache-Control': 'private', // only cache by client
    'X-Robots-Tag': 'noindex, nofollow', // prevent crawling
    'Content-Type': 'application/javascript'
  })
  res.render('../js/lib/common/constant.ejs', data)
})

export = statusRouter
