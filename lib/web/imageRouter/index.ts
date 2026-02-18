'use strict'

import type { Request, Response } from 'express'
import { Router } from 'express'
const formidable = require('formidable')
import * as path from 'path'
import * as fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import * as os from 'os'
import rimraf = require('rimraf')
const isSvg = require('is-svg')
import { JSDOM } from 'jsdom'

import config = require('../../config')
import logger = require('../../logger')
import * as errors from '../../errors'

let DOMPurify: any
try {
  const window = new JSDOM('').window
  ;(global as any).window = window
  const createDOMPurify = require('dompurify')
  DOMPurify = createDOMPurify(window)
} catch (err) {
  logger.error('Failed to initialize DOMPurify for SVG sanitization:', err)
}

const imageRouter = Router()

async function checkUploadType (filePath: string): Promise<boolean> {
  const extension = path.extname(filePath).toLowerCase()
  const FileType = await import('file-type')
  let typeFromMagic = await FileType.fileTypeFromFile(filePath) as { ext: string; mime: string } | undefined
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
    (typeFromMagic as any).ext = extension.substr(1)
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

function sanitizeSvg (filePath: string): boolean {
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
imageRouter.post('/uploadimage', function (req: Request, res: Response) {
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
    filename: function (filename: string, ext: string) {
      if (typeof ext !== 'string') {
        ext = '.invalid'
      }
      return uuidv4() + ext
    }
  })

  form.parse(req, async function (err: any, fields: any, files: any) {
    if (err) {
      logger.error(`Image upload error: formidable error: ${err}`)
      rimraf.sync(tmpDir)
      return errors.errorForbidden(res)
    } else if (!files.image || !files.image.filepath) {
      logger.error('Image upload error: Upload didn\'t contain file)')
      rimraf.sync(tmpDir)
      return errors.errorBadRequest(res)
    } else if (!(await checkUploadType(files.image.filepath))) {
      rimraf.sync(tmpDir)
      return errors.errorBadRequest(res)
    } else {
      const extension = path.extname(files.image.filepath).toLowerCase()
      if (extension === '.svg' && !sanitizeSvg(files.image.filepath)) {
        logger.error('Image upload error: SVG sanitization failed')
        rimraf.sync(tmpDir)
        return errors.errorBadRequest(res)
      }

      logger.debug(
        `SERVER received uploadimage: ${JSON.stringify(files.image)}`
      )

      const uploadProvider = require('./' + config.imageUploadType)
      logger.debug(
        `imageRouter: Uploading ${files.image.filepath} using ${config.imageUploadType}`
      )
      uploadProvider.uploadImage(files.image.filepath, function (err: Error | null, url: string) {
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

export = imageRouter
