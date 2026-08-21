'use strict'

import isSvg from 'is-svg'
import formidable from 'formidable'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const Router = require('express').Router
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const os = require('os')
const rimraf = require('rimraf')
const { JSDOM } = require('jsdom')

const config = require('../../config')
const logger = require('../../logger')
const errors = require('../../errors')

let DOMPurify
try {
  const window = new JSDOM('').window
  global.window = window
  const createDOMPurify = require('dompurify')
  DOMPurify = createDOMPurify(window)
} catch (err) {
  logger.error('Failed to initialize DOMPurify for SVG sanitization:', err)
}

const imageRouter = Router()
export default imageRouter

async function checkUploadType (filePath) {
  const extension = path.extname(filePath).toLowerCase()
  const FileType = await import('file-type')
  let typeFromMagic = await FileType.fileTypeFromFile(filePath)
  if (extension === '.svg' && (typeFromMagic === undefined || typeFromMagic.mime === 'application/xml')) {
    const fileContent = fs.readFileSync(filePath)
    if (isSvg(fileContent.toString())) {
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

function sanitizeSvg (filePath) {
  if (!DOMPurify) {
    logger.error('SVG sanitization failed: DOMPurify not initialized')
    return false
  }

  try {
    const svgContent = fs.readFileSync(filePath, 'utf8')
    const cleanSvg = DOMPurify.sanitize(svgContent, {
      USE_PROFILES: { svg: true, svgFilters: true }
    })

    if (!cleanSvg) {
      logger.error('SVG sanitization resulted in empty content')
      return false
    }

    fs.writeFileSync(filePath, cleanSvg, 'utf8')
    return true
  } catch (err) {
    logger.error('SVG sanitization error:', err)
    return false
  }
}

// upload image
imageRouter.post('/uploadimage', function (req, res) {
  const uploadsEnabled = config.enableUploads
  if (uploadsEnabled === 'none') {
    logger.error('Image upload error: Uploads are disabled')
    return errors.errorForbidden(res)
  }
  if (
    uploadsEnabled === 'registered' &&
    !req.isAuthenticated()
  ) {
    logger.error(
      'Image upload error: Anonymous uploads are not allowed'
    )
    return errors.errorForbidden(res)
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hedgedoc-'))
  const form = formidable({
    keepExtensions: true,
    uploadDir: tmpDir,
    filename: function (filename, ext) {
      if (typeof ext !== 'string') {
        ext = '.invalid'
      }
      return uuidv4() + ext
    }
  })

  form.parse(req, async function (err, _fields, files) {
    if (err) {
      logger.error(`Image upload error: formidable error: ${err}`)
      rimraf.sync(tmpDir)
      return errors.errorForbidden(res)
    } else if (!files.image || !files.image.length < 1 || !files.image[0].filepath) {
      logger.debug(`${JSON.stringify(files)}`)
      logger.error('Image upload error: Upload didn\'t contain file)')
      rimraf.sync(tmpDir)
      return errors.errorBadRequest(res)
    } else if (!(await checkUploadType(files.image[0].filepath))) {
      rimraf.sync(tmpDir)
      return errors.errorBadRequest(res)
    } else {
      const extension = path.extname(files.image[0].filepath).toLowerCase()
      if (extension === '.svg' && !sanitizeSvg(files.image[0].filepath)) {
        logger.error('Image upload error: SVG sanitization failed')
        rimraf.sync(tmpDir)
        return errors.errorBadRequest(res)
      }

      logger.debug(
        `SERVER received uploadimage: ${JSON.stringify(files.image)}`
      )

      const uploadProvider = require('./' + config.imageUploadType)
      logger.debug(
        `imageRouter: Uploading ${files.image[0].filepath} using ${config.imageUploadType}`
      )
      uploadProvider.uploadImage(files.image[0].filepath, function (err, url) {
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
