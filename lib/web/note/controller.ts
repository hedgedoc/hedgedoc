import {NextFunction, Response} from "express";
import {NoteUtils} from "./util";

import models from "../../models";

import noteActions from "./actions";
import errors from "../../errors";
import config from "../../config";
import logger from "../../logger";

export module NoteController {
  export function publishNoteActions(req: any, res: Response, next: NextFunction) {
    NoteUtils.findNote(req, res, function (note) {
      const action = req.params.action;
      switch (action) {
        case 'download':
          exports.downloadMarkdown(req, res, note);
          break;
        case 'edit':
          res.redirect(config.serverURL + '/' + (note.alias ? note.alias : models.Note.encodeNoteId(note.id)) + '?both');
          break;
        default:
          res.redirect(config.serverURL + '/s/' + note.shortid);
          break
      }
    })
  }

  export function showPublishNote(req: any, res: Response, next: NextFunction) {
    const include = [{
      model: models.User,
      as: 'owner'
    }, {
      model: models.User,
      as: 'lastchangeuser'
    }];
    NoteUtils.findNote(req, res, function (note) {
      // force to use short id
      const shortid = req.params.shortid;
      if ((note.alias && shortid !== note.alias) || (!note.alias && shortid !== note.shortid)) {
        return res.redirect(config.serverURL + '/s/' + (note.alias || note.shortid))
      }
      note.increment('viewcount').then(function (note) {
        if (!note) {
          return errors.errorNotFound(res)
        }
        NoteUtils.getPublishData(req, res, note, (data) => {
          res.set({
            'Cache-Control': 'private' // only cache by client
          });
          return res.render('pretty.ejs', data)
        })
      }).catch(function (err) {
        logger.error(err);
        return errors.errorInternalError(res)
      })
    }, include)
  }

  export function showNote(req: any, res: Response, next: NextFunction) {
    NoteUtils.findNote(req, res, function (note) {
      // force to use note id
      const noteId = req.params.noteId;
      const id = models.Note.encodeNoteId(note.id);
      if ((note.alias && noteId !== note.alias) || (!note.alias && noteId !== id)) {
        return res.redirect(config.serverURL + '/' + (note.alias || id))
      }
      const body = note.content;
      const extracted = models.Note.extractMeta(body);
      const meta = models.Note.parseMeta(extracted.meta);
      let title = models.Note.decodeTitle(note.title);
      title = models.Note.generateWebTitle(meta.title || title);
      const opengraph = models.Note.parseOpengraph(meta, title);
      res.set({
        'Cache-Control': 'private', // only cache by client
        'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
      });
      return res.render('codimd.ejs', {
        title: title,
        opengraph: opengraph
      })
    })
  }

  export function createFromPOST(req: any, res: Response, next: NextFunction) {
    let body = '';
    if (req.body && req.body.length > config.documentMaxLength) {
      return errors.errorTooLong(res)
    } else if (req.body) {
      body = req.body
    }
    body = body.replace(/[\r]/g, '');
    return NoteUtils.newNote(req, res, body)
  }

  export function doAction(req: any, res: Response, next: NextFunction) {
    const noteId = req.params.noteId;
    NoteUtils.findNote(req, res, function (note) {
      const action = req.params.action;
      switch (action) {
        case 'publish':
        case 'pretty': // pretty deprecated
          res.redirect(config.serverURL + '/s/' + (note.alias || note.shortid));
          break;
        case 'slide':
          res.redirect(config.serverURL + '/p/' + (note.alias || note.shortid));
          break;
        case 'download':
          exports.downloadMarkdown(req, res, note);
          break;
        case 'info':
          noteActions.getInfo(req, res, note);
          break;
        case 'pdf':
          if (config.allowPDFExport) {
            noteActions.createPDF(req, res, note)
          } else {
            logger.error('PDF export failed: Disabled by config. Set "allowPDFExport: true" to enable. Check the documentation for details');
            errors.errorForbidden(res)
          }
          break;
        case 'gist':
          noteActions.createGist(req, res, note);
          break;
        case 'revision':
          noteActions.getRevision(req, res, note);
          break;
        default:
          return res.redirect(config.serverURL + '/' + noteId)
      }
    })
  }

  export function downloadMarkdown(req: Request, res: Response, note: any) {
    const body = note.content;
    let filename = models.Note.decodeTitle(note.title);
    filename = encodeURIComponent(filename);
    res.set({
      'Access-Control-Allow-Origin': '*', // allow CORS as API
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
      'Content-Type': 'text/markdown; charset=UTF-8',
      'Cache-Control': 'private',
      'Content-disposition': 'attachment; filename=' + filename + '.md',
      'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
    });
    res.send(body)
  }
}
