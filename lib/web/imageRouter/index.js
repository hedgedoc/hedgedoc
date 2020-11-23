'use strict'

const Router = require('express').Router
const formidable = require('formidable')

const config = require('../../config')
const logger = require('../../logger')
const errors = require('../../errors')

const imageRouter = module.exports = Router()

// upload image
imageRouter.post('/uploadimage', function (req, res) {
  var form = new formidable.IncomingForm()

  form.keepExtensions = true

  if (config.imageUploadType === 'filesystem') {
    form.uploadDir = config.uploadsPath
  }

  form.parse(req, function (err, fields, files) {
    if (err) {
      logger.error(`formidable error: ${err}`)
      return errors.errorForbidden(res)
  } else if (!req.isAuthenticated() && !config.allowAnonymous && !config.allowAnonymousEdits) {
      logger.error(`formidable error: Anonymous edits and therefore uploads are not allowed)`)
      return errors.errorForbidden(res)
    } else if (!files.image || !files.image.path) {
      logger.error(`formidable error: Upload didn't contain file)`)
      return errors.errorBadRequest(res)
    } else if (!config.allowedUploadMimeTypes.includes(files.image.type)) {
      logger.error(`formidable error: MIME-type "${files.image.type}" of uploaded file not allowed, only "${config.allowedUploadMimeTypes.join(', ')}" are allowed)`)
      return errors.errorBadRequest(res)
    } else {
      logger.debug(`SERVER received uploadimage: ${JSON.stringify(files.image)}`)

      const uploadProvider = require('./' + config.imageUploadType)
      logger.debug(`imageRouter: Uploading ${files.image.path} using ${config.imageUploadType}`)
      uploadProvider.uploadImage(files.image.path, function (err, url) {
        if (err !== null) {
          logger.error(err)
          return res.status(500).end('upload image error')
        }
        logger.debug(`SERVER sending ${url} to client`)
        res.send({
          link: url
        })
      })
    }
  })
})
