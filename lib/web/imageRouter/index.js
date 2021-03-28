'use strict'

const Router = require('express').Router
const formidable = require('formidable')
const path = require('path')
const FileType = require('file-type')
const fs = require('fs')
const os = require('os')
const rimraf = require('rimraf')
const isSvg = require('is-svg')

const config = require('../../config')
const logger = require('../../logger')
const errors = require('../../errors')

const imageRouter = (module.exports = Router())

async function checkUploadType (filePath) {
  const extension = path.extname(filePath).toLowerCase()
  let typeFromMagic = await FileType.fromFile(filePath)
  if (extension === '.svg' && (typeFromMagic === undefined || typeFromMagic.mime === 'application/xml')) {
    const fileContent = fs.readFileSync(filePath)
    if (isSvg(fileContent)) {
      typeFromMagic = {
        ext: 'svg',
        mime: 'image/svg+xml'
      }
    }
  }
  if (typeFromMagic === undefined) {
    logger.error('Image upload error: Could not determine MIME-type')
    return false
  }
  // .jpeg, .jfif, .jpe files are identified by FileType to have the extension jpg
  if (['.jpeg', '.jfif', '.jpe'].includes(extension) && typeFromMagic.ext === 'jpg') {
    typeFromMagic.ext = extension.substr(1)
  }
  if (extension !== '.' + typeFromMagic.ext) {
    logger.error(
      'Image upload error: Provided file extension does not match MIME-type'
    )
    return false
  }
  if (!config.allowedUploadMimeTypes.includes(typeFromMagic.mime)) {
    logger.error(
      `Image upload error: MIME-type "${
        typeFromMagic.mime
      }" of uploaded file not allowed, only "${config.allowedUploadMimeTypes.join(
        ', '
      )}" are allowed`
    )
    return false
  }
  return true
}

// upload image
imageRouter.post('/uploadimage', function (req, res) {
  if (
    !req.isAuthenticated() &&
    !config.allowAnonymous &&
    !config.allowAnonymousEdits
  ) {
    logger.error(
      'Image upload error: Anonymous edits and therefore uploads are not allowed'
    )
    return errors.errorForbidden(res)
  }

  const form = new formidable.IncomingForm()
  form.keepExtensions = true
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hedgedoc-'))
  form.uploadDir = tmpDir

  form.parse(req, async function (err, fields, files) {
    if (err) {
      logger.error(`Image upload error: formidable error: ${err}`)
      rimraf(tmpDir)
      return errors.errorForbidden(res)
    } else if (!files.image || !files.image.path) {
      logger.error("Image upload error: Upload didn't contain file)")
      rimraf.sync(tmpDir)
      return errors.errorBadRequest(res)
    } else if (!(await checkUploadType(files.image.path))) {
      rimraf.sync(tmpDir)
      return errors.errorBadRequest(res)
    } else {
      logger.debug(
        `SERVER received uploadimage: ${JSON.stringify(files.image)}`
      )

      const uploadProvider = require('./' + config.imageUploadType)
      logger.debug(
        `imageRouter: Uploading ${files.image.path} using ${config.imageUploadType}`
      )
      uploadProvider.uploadImage(files.image.path, function (err, url) {
        rimraf.sync(tmpDir)
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
