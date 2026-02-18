import type { Request, Response, NextFunction } from 'express'
import * as noteUtil from './util'
import models = require('../../models')
import * as errors from '../../errors'
import logger = require('../../logger')
import config = require('../../config')

export function publishSlideActions (req: Request, res: Response, next: NextFunction): void {
  noteUtil.findNote(req, res, function (note: any) {
    const action = req.params.action
    if (action === 'edit') {
      res.redirect(config.serverURL + '/' + (note.alias ? note.alias : models.Note.encodeNoteId(note.id)) + '?both')
    } else { res.redirect(config.serverURL + '/p/' + note.shortid) }
  })
}

export function showPublishSlide (req: Request, res: Response, next: NextFunction): void {
  const include = [{
    model: models.User,
    as: 'owner'
  }, {
    model: models.User,
    as: 'lastchangeuser'
  }]
  noteUtil.findNote(req, res, function (note: any) {
    // force to use short id
    const shortid = req.params.shortid
    if ((note.alias && shortid !== note.alias) || (!note.alias && shortid !== note.shortid)) {
      return res.redirect(config.serverURL + '/p/' + (note.alias || note.shortid))
    }
    note.increment('viewcount').then(function (note: any) {
      if (!note) {
        return errors.errorNotFound(res)
      }
      noteUtil.getPublishData(req, res, note, (data: Record<string, unknown>) => {
        res.set({
          'Cache-Control': 'private' // only cache by client
        })
        return res.render('slide.ejs', data)
      })
    }).catch(function (err: Error) {
      logger.error(err)
      return errors.errorInternalError(res)
    })
  }, include)
}
