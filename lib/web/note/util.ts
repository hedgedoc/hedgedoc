import type { Request, Response } from 'express'
import models = require('../../models')
import logger = require('../../logger')
import config = require('../../config')
import * as errors from '../../errors'
import * as fs from 'fs'
import * as path from 'path'

export function findNote (req: Request, res: Response, callback: (note: any) => void, include: any[] | null = null, createIfNotFound: boolean = false): void {
  const id = req.params.noteId || req.params.shortid
  models.Note.parseNoteId(id, function (err: Error | null, _id: string) {
    if (err) {
      logger.error(err)
      return errors.errorInternalError(res)
    }
    models.Note.findOne({
      where: {
        id: _id
      },
      include: include || null
    }).then(function (note: any) {
      if (!note && createIfNotFound) {
        if (config.disableNoteCreation) {
          return errors.errorNotFound(res)
        } else {
          return exports.newNote(req, res, '')
        }
      }
      if (!note && !createIfNotFound) {
        return errors.errorNotFound(res)
      }
      if (!exports.checkViewPermission(req, note)) {
        return errors.errorForbidden(res)
      } else {
        return callback(note)
      }
    }).catch(function (err: Error) {
      logger.error(err)
      return errors.errorInternalError(res)
    })
  })
}

export function checkViewPermission (req: Request, note: any): boolean {
  if (note.permission === 'private') {
    return !(!req.isAuthenticated() || note.ownerId !== (req as any).user.id)
  } else if (note.permission === 'limited' || note.permission === 'protected') {
    return req.isAuthenticated()
  } else {
    return true
  }
}

export async function newNote (req: Request, res: Response, body: string): Promise<void> {
  let owner: string | null = null
  const noteId = req.params.noteId ? req.params.noteId : null
  if (req.isAuthenticated()) {
    owner = (req as any).user.id
  } else if (!config.allowAnonymous) {
    return errors.errorForbidden(res)
  }
  if (noteId) {
    if (config.allowFreeURL && !config.forbiddenNoteIDs.includes(noteId) && (!config.requireFreeURLAuthentication || req.isAuthenticated())) {
      (req as any).alias = noteId
    } else {
      return req.method === 'POST' ? errors.errorForbidden(res) : errors.errorNotFound(res)
    }

    try {
      const id = await new Promise<string>((resolve, reject) => {
        models.Note.parseNoteId(noteId, (err: Error | null, id: string) => {
          if (err) {
            reject(err)
          } else {
            resolve(id)
          }
        })
      })

      if (id) {
        return errors.errorConflict(res)
      }
    } catch (error) {
      logger.error(error)
      return errors.errorInternalError(res)
    }
  }
  models.Note.create({
    ownerId: owner,
    alias: (req as any).alias ? (req as any).alias : null,
    content: body,
    title: models.Note.parseNoteTitle(body)
  }).then(function (note: any) {
    return res.redirect(config.serverURL + '/' + (note.alias ? note.alias : models.Note.encodeNoteId(note.id)))
  }).catch(function (err: Error) {
    logger.error('Note could not be created: ' + err)
    return errors.errorInternalError(res)
  })
}

export function getPublishData (req: Request, res: Response, note: any, callback: (data: Record<string, unknown>) => void): void {
  const body = note.content
  const extracted = models.Note.extractMeta(body)
  let markdown = extracted.markdown
  const meta = models.Note.parseMeta(extracted.meta)
  // extractMeta() will remove the meta part from markdown,
  // so we need to re-add the `breaks` option for proper rendering
  if (typeof extracted.meta.breaks === 'boolean') {
    markdown = '---\nbreaks: ' + extracted.meta.breaks + '\n---\n' + markdown
  }
  const createtime = note.createdAt
  const updatetime = note.lastchangeAt
  let title = models.Note.decodeTitle(note.title)
  title = models.Note.generateWebTitle(meta.title || title)
  const ogdata = models.Note.parseOpengraph(meta, title)
  const data = {
    title,
    description: meta.description || (markdown ? models.Note.generateDescription(markdown) : null),
    lang: meta.lang || null,
    viewcount: note.viewcount,
    createtime,
    updatetime,
    body: markdown,
    theme: meta.slideOptions && isRevealTheme(meta.slideOptions.theme),
    meta: JSON.stringify(extracted.meta),
    owner: note.owner ? note.owner.id : null,
    ownerprofile: note.owner ? models.User.getProfile(note.owner) : null,
    lastchangeuser: note.lastchangeuser ? note.lastchangeuser.id : null,
    lastchangeuserprofile: note.lastchangeuser ? models.User.getProfile(note.lastchangeuser) : null,
    robots: meta.robots || false, // default allow robots
    GA: meta.GA,
    disqus: meta.disqus,
    cspNonce: (res as any).locals.nonce,
    dnt: req.headers.dnt,
    opengraph: ogdata
  }
  callback(data)
}

function isRevealTheme (theme: string): string | undefined {
  if (fs.existsSync(path.join(__dirname, '..', '..', '..', '..', 'public', 'build', 'reveal.js', 'css', 'theme', theme + '.css'))) {
    return theme
  }
  return undefined
}
