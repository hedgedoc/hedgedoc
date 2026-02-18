'use strict'

import type { Request, Response, NextFunction } from 'express'
import archiver = require('archiver')
import sanitizeFilename = require('sanitize-filename')
import async = require('async')
import { Router } from 'express'
import * as errors from '../errors'
import config = require('../config')
import models = require('../models')
import logger = require('../logger')
import { generateAvatar } from '../letter-avatars'

const UserRouter = Router()

// get me info
UserRouter.get('/me', function (req: Request, res: Response) {
  if (req.isAuthenticated()) {
    models.User.findOne({
      where: {
        id: (req as any).user.id
      }
    }).then(function (user: any) {
      if (!user) { return errors.errorNotFound(res) }
      const profile = models.User.getProfile(user)
      res.send({
        status: 'ok',
        id: (req as any).user.id,
        name: profile.name,
        photo: profile.photo
      })
    }).catch(function (err: Error) {
      logger.error('read me failed: ' + err)
      return errors.errorInternalError(res)
    })
  } else {
    res.send({
      status: 'forbidden'
    })
  }
})

// delete the currently authenticated user
UserRouter.get('/me/delete/:token?', function (req: Request, res: Response) {
  if (req.isAuthenticated()) {
    models.User.findOne({
      where: {
        id: (req as any).user.id
      }
    }).then(function (user: any) {
      if (!user) {
        return errors.errorNotFound(res)
      }
      if (user.deleteToken === req.params.token) {
        user.destroy().then(function () {
          res.redirect(config.serverURL + '/')
        })
      } else {
        return errors.errorForbidden(res)
      }
    }).catch(function (err: Error) {
      logger.error('delete user failed: ' + err)
      return errors.errorInternalError(res)
    })
  } else {
    return errors.errorForbidden(res)
  }
})

// export the data of the authenticated user
UserRouter.get('/me/export', function (req: Request, res: Response) {
  if (req.isAuthenticated()) {
    // let output = fs.createWriteStream(__dirname + '/example.zip');
    const archive = archiver('zip', {
      zlib: { level: 3 } // Sets the compression level.
    })
    res.setHeader('Content-Type', 'application/zip')
    res.attachment('archive.zip')
    archive.pipe(res)
    archive.on('error', function (err: Error) {
      logger.error('export user data failed: ' + err)
      return errors.errorInternalError(res)
    })
    models.User.findOne({
      where: {
        id: (req as any).user.id
      }
    }).then(function (user: any) {
      models.Note.findAll({
        where: {
          ownerId: user.id
        }
      }).then(function (notes: any[]) {
        const filenames: Record<string, boolean> = {}
        async.each(notes, function (note: any, callback: async.ErrorCallback) {
          const basename: string = sanitizeFilename(note.title, { replacement: '_' })
          let filename: string
          let suffix: number | string = ''
          do {
            const seperator = typeof suffix === 'number' ? '-' : ''
            filename = basename + seperator + suffix + '.md'
            suffix = typeof suffix === 'number' ? suffix + 1 : 0
          } while (filenames[filename])
          filenames[filename] = true

          logger.debug('Write: ' + filename)
          archive.append(Buffer.from(note.content), { name: filename, date: note.lastchangeAt })
          callback(null)
        }, function (err: Error | null | undefined) {
          if (err) {
            return errors.errorInternalError(res)
          }
          archive.finalize()
        })
      })
    }).catch(function (err: Error) {
      logger.error('export user data failed: ' + err)
      return errors.errorInternalError(res)
    })
  } else {
    return errors.errorForbidden(res)
  }
})

UserRouter.get('/user/:username/avatar.svg', function (req: Request, res: Response, _next: NextFunction) {
  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.send(generateAvatar(req.params.username as string))
})

export = UserRouter
