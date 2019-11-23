import {Includeable} from "sequelize";
import {Response} from "express";

import path from "path";
import fs from "fs";
import errors from "../../errors";
import config from "../../config";
import logger from "../../logger";
import models from "../../models";

export module NoteUtils {
  export function findNote(req, res, callback: (note: any) => void, include?: Includeable[]) {
    const id = req.params.noteId || req.params.shortid;
    models.Note.parseNoteId(id, function (err, _id) {
      if (err) {
        logger.error(err);
        return errors.errorInternalError(res)
      }
      models.Note.findOne({
        where: {
          id: _id
        },
        include: include || null
      }).then(function (note) {
        if (!note) {
          return newNote(req, res, null)
        }
        if (!checkViewPermission(req, note)) {
          return errors.errorForbidden(res)
        } else {
          return callback(note)
        }
      }).catch(function (err) {
        logger.error(err);
        return errors.errorInternalError(res)
      })
    })
  }

  export function checkViewPermission(req: any, note: any) {
    if (note.permission === 'private') {
      return !(!req.isAuthenticated() || note.ownerId !== req.user.id)
    } else if (note.permission === 'limited' || note.permission === 'protected') {
      return req.isAuthenticated()
    } else {
      return true
    }
  }

  export function newNote(req: any, res: Response, body: string) {
    let owner = null;
    const noteId = req.params.noteId ? req.params.noteId : null;
    if (req.isAuthenticated()) {
      owner = req.user.id
    } else if (!config.allowAnonymous) {
      return errors.errorForbidden(res)
    }
    if (config.allowFreeURL && noteId && !config.forbiddenNoteIDs.includes(noteId)) {
      req.alias = noteId
    } else if (noteId) {
      return req.method === 'POST' ? errors.errorForbidden(res) : errors.errorNotFound(res)
    }
    models.Note.create({
      ownerId: owner,
      alias: req.alias ? req.alias : null,
      content: body
    }).then(function (note) {
      return res.redirect(config.serverURL + '/' + (note.alias ? note.alias : models.Note.encodeNoteId(note.id)))
    }).catch(function (err) {
      logger.error(err);
      return errors.errorInternalError(res)
    })
  }

  export function getPublishData(req: any, res: Response, note: any, callback: (data: any) => void) {
    const body = note.content;
    const extracted = models.Note.extractMeta(body);
    const markdown = extracted.markdown;
    const meta = models.Note.parseMeta(extracted.meta);
    const createtime = note.createdAt;
    const updatetime = note.lastchangeAt;
    let title = models.Note.decodeTitle(note.title);
    title = models.Note.generateWebTitle(meta.title || title);
    const ogdata = models.Note.parseOpengraph(meta, title);
    const data = {
      title: title,
      description: meta.description || (markdown ? models.Note.generateDescription(markdown) : null),
      viewcount: note.viewcount,
      createtime: createtime,
      updatetime: updatetime,
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
      cspNonce: res.locals.nonce,
      dnt: req.headers.dnt,
      opengraph: ogdata
    };
    callback(data)
  }

  function isRevealTheme(theme: string) {
    if (fs.existsSync(path.join(__dirname, '..', 'public', 'build', 'reveal.js', 'css', 'theme', theme + '.css'))) {
      return theme
    }
    return undefined
  }
}

