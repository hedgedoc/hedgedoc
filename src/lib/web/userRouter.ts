import archiver from 'archiver'
import async from 'async'
import { Request, Response, Router } from 'express'
import { errors } from '../errors'
import { Note, User } from '../models'
import { logger } from '../logger'
import { generateAvatar } from '../letter-avatars'
import { config } from '../config'

const UserRouter = Router()

// get me info
UserRouter.get('/me', function (req: Request, res: Response) {
  if (req.isAuthenticated()) {
    if (req.user == null) {
      return errors.errorInternalError(res)
    }
    User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      if (!user) { return errors.errorNotFound(res) }
      const profile = User.getProfile(user)
      if (profile == null) {
        return errors.errorInternalError(res)
      }
      res.send({
        status: 'ok',
        id: user.id,
        name: profile.name,
        photo: profile.photo
      })
    }).catch(function (err) {
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
    if (req.user == null) {
      return errors.errorInternalError(res)
    }
    User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
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
    }).catch(function (err) {
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
    if (req.user == null) {
      return errors.errorInternalError(res)
    }
    // let output = fs.createWriteStream(__dirname + '/example.zip');
    const archive = archiver('zip', {
      zlib: { level: 3 } // Sets the compression level.
    })
    res.setHeader('Content-Type', 'application/zip')
    res.attachment('archive.zip')
    archive.pipe(res)
    archive.on('error', function (err) {
      logger.error('export user data failed: ' + err)
      return errors.errorInternalError(res)
    })
    User.findOne({
      where: {
        id: req.user.id
      }
    }).then(function (user) {
      if (user == null) {
        return errors.errorInternalError(res)
      }
      Note.findAll({
        where: {
          ownerId: user.id
        }
      }).then(function (notes) {
        const filenames = {}
        async.each(notes, function (note, callback) {
          const basename = note.title.replace(/\//g, '-') // Prevent subdirectories
          let filename
          let numberOfDuplicateFilename = 0
          do {
            const suffix = numberOfDuplicateFilename !== 0 ? '-' + numberOfDuplicateFilename : ''
            filename = basename + suffix + '.md'
            numberOfDuplicateFilename++
          } while (filenames[filename])
          filenames[filename] = true

          logger.debug('Write: ' + filename)
          archive.append(Buffer.from(note.content), { name: filename, date: note.lastchangeAt })
          callback(null, null)
        }, function (err) {
          if (err) {
            return errors.errorInternalError(res)
          }

          archive.finalize()
        })
      })
    }).catch(function (err) {
      logger.error('export user data failed: ' + err)
      return errors.errorInternalError(res)
    })
  } else {
    return errors.errorForbidden(res)
  }
})

UserRouter.get('/user/:username/avatar.svg', function (req: Request, res: Response, _) {
  res.setHeader('Content-Type', 'image/svg+xml')
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.send(generateAvatar(req.params.username))
})

export { UserRouter }
