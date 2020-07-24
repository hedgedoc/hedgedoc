import { Router } from 'express'
import formidable from 'formidable'

import { config } from '../../config'
import { logger } from '../../logger'
import { errors } from '../../errors'
import { AzureUploadProvider } from './azure'
import { FilesystemUploadProvider } from './filesystem'
import { ImgurUploadProvider } from './imgur'
import { LutimUploadProvider } from './lutim'
import { MinioUploadProvider } from './minio'
import { S3UploadProvider } from './s3'

interface UploadProvider {
  uploadImage: (imagePath: string, callback: (err?: Error, url?: string) => void) => void;
}

const ImageRouter = Router()

// upload image
ImageRouter.post('/uploadimage', function (req, res) {
  const form = new formidable.IncomingForm()

  form.keepExtensions = true

  if (config.imageUploadType === 'filesystem') {
    form.uploadDir = config.uploadsPath
  }

  form.parse(req, function (err, fields, files) {
    if (err || !files.image || !files.image.path) {
      logger.error(`formidable error: ${err}`)
      errors.errorForbidden(res)
    } else {
      logger.debug(`SERVER received uploadimage: ${JSON.stringify(files.image)}`)

      let uploadProvider: UploadProvider
      switch (config.imageUploadType) {
        case 'azure':
          uploadProvider = AzureUploadProvider
          break
        case 'filesystem':
        default:
          uploadProvider = FilesystemUploadProvider
          break
        case 'imgur':
          uploadProvider = ImgurUploadProvider
          break
        case 'lutim':
          uploadProvider = LutimUploadProvider
          break
        case 'minio':
          uploadProvider = MinioUploadProvider
          break
        case 's3':
          uploadProvider = S3UploadProvider
          break
      }

      logger.debug(`imageRouter: Uploading ${files.image.path} using ${config.imageUploadType}`)
      uploadProvider.uploadImage(files.image.path, function (err, url) {
        if (err !== undefined) {
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

export { ImageRouter, UploadProvider }
