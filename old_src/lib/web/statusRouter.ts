import { config } from '../config'
import { Router } from 'express'
import { errors } from '../errors'
import { realtime } from '../realtime'
import { Temp } from '../models'
import { logger } from '../logger'
import { urlencodedParser } from './utils'

const StatusRouter = Router()

// get status
StatusRouter.get('/status', function (req, res, _) {
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
StatusRouter.get('/temp', function (req, res) {
  const host = req.get('host')
  if (config.allowOrigin.indexOf(host) === -1) {
    errors.errorForbidden(res)
  } else {
    const tempid = req.query.tempid
    if (!tempid || typeof tempid !== 'string') {
      errors.errorForbidden(res)
    } else {
      Temp.findOne({
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
StatusRouter.post('/temp', urlencodedParser, function (req, res) {
  const host = req.get('host')
  if (config.allowOrigin.indexOf(host) === -1) {
    errors.errorForbidden(res)
  } else {
    const data = req.body.data
    if (!data) {
      errors.errorForbidden(res)
    } else {
      logger.debug(`SERVER received temp from [${host}]: ${req.body.data}`)
      Temp.create({
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

StatusRouter.get('/config', function (req, res) {
  const data = {
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

export { StatusRouter }
