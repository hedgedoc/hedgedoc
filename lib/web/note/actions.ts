import type { Request, Response } from 'express'
import models = require('../../models')
import logger = require('../../logger')
import config = require('../../config')
import * as errors from '../../errors'
import nanoid = require('nanoid')
import moment = require('moment')
import querystring = require('querystring')

export function getInfo (req: Request, res: Response, note: any): void {
  const body = note.content
  const extracted = models.Note.extractMeta(body)
  const markdown = extracted.markdown
  const meta = models.Note.parseMeta(extracted.meta)
  const createtime = note.createdAt
  const updatetime = note.lastchangeAt
  const title = models.Note.decodeTitle(note.title)
  const data = {
    title: meta.title || title,
    description: meta.description || (markdown ? models.Note.generateDescription(markdown) : null),
    viewcount: note.viewcount,
    createtime,
    updatetime
  }
  res.set({
    'Access-Control-Allow-Origin': '*', // allow CORS as API
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
    'Cache-Control': 'private', // only cache by client
    'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
  })
  res.send(data)
}

export function createGist (req: Request, res: Response, note: any): void {
  const data = {
    client_id: config.github.clientID,
    redirect_uri: config.serverURL + '/auth/github/callback/' + models.Note.encodeNoteId(note.id) + '/gist',
    scope: 'gist',
    state: nanoid.nanoid()
  }
  const query = querystring.stringify(data)
  res.redirect('https://github.com/login/oauth/authorize?' + query)
}

export function getRevision (req: Request, res: Response, note: any): void {
  const actionId = req.params.actionId as string
  if (actionId) {
    const time = moment(parseInt(actionId))
    if (time.isValid()) {
      models.Revision.getPatchedNoteRevisionByTime(note, time, function (err: Error | null, content: string | null) {
        if (err) {
          logger.error(err)
          return errors.errorInternalError(res)
        }
        if (!content) {
          return errors.errorNotFound(res)
        }
        res.set({
          'Access-Control-Allow-Origin': '*', // allow CORS as API
          'Access-Control-Allow-Headers': 'Range',
          'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
          'Cache-Control': 'private', // only cache by client
          'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
        })
        res.send(content)
      })
    } else {
      return errors.errorNotFound(res)
    }
  } else {
    models.Revision.getNoteRevisions(note, function (err: Error | null, data: unknown) {
      if (err) {
        logger.error(err)
        return errors.errorInternalError(res)
      }
      const out = {
        revision: data
      }
      res.set({
        'Access-Control-Allow-Origin': '*', // allow CORS as API
        'Access-Control-Allow-Headers': 'Range',
        'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
        'Cache-Control': 'private', // only cache by client
        'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
      })
      res.send(out)
    })
  }
}
