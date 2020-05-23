import { NextFunction, Response } from 'express'
import { config } from '../../config'
import { errors } from '../../errors'
import { logger } from '../../logger'
import { Note, User } from '../../models'
import * as NoteUtils from './util'

export function publishSlideActions (req: any, res: Response, next: NextFunction) {
  NoteUtils.findNoteOrCreate(req, res, function (note) {
    const action = req.params.action
    if (action === 'edit') {
      res.redirect(config.serverURL + '/' + (note.alias ? note.alias : Note.encodeNoteId(note.id)) + '?both')
    } else {
      res.redirect(config.serverURL + '/p/' + note.shortid)
    }
  })
}

export function showPublishSlide (req: any, res: Response, next: NextFunction) {
  const include = [{
    model: User,
    as: 'owner'
  }, {
    model: User,
    as: 'lastchangeuser'
  }]
  NoteUtils.findNoteOrCreate(req, res, function (note) {
    // force to use short id
    const shortid = req.params.shortid
    if ((note.alias && shortid !== note.alias) || (!note.alias && shortid !== note.shortid)) {
      return res.redirect(config.serverURL + '/p/' + (note.alias || note.shortid))
    }
    note.increment('viewcount').then(function (note) {
      if (!note) {
        return errors.errorNotFound(res)
      }
      NoteUtils.getPublishData(req, res, note, (data) => {
        res.set({
          'Cache-Control': 'private' // only cache by client
        })
        return res.render('slide.ejs', data)
      })
    }).catch(function (err) {
      logger.error(err)
      return errors.errorInternalError(res)
    })
  }, include)
}
