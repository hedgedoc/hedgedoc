'use strict'

const models = require('../../models')
const logger = require('../../logger')
const config = require('../../config')
const errors = require('../../errors')

const noteUtil = require('./util')
const noteActions = require('./actions')

exports.publishNoteActions = function (req, res, next) {
  noteUtil.findNote(req, res, function (note) {
    const action = req.params.action
    switch (action) {
      case 'download':
        exports.downloadMarkdown(req, res, note)
        break
      case 'edit':
        res.redirect(config.serverURL + '/' + (note.alias ? note.alias : models.Note.encodeNoteId(note.id)) + '?both')
        break
      default:
        res.redirect(config.serverURL + '/s/' + note.shortid)
        break
    }
  })
}

exports.showPublishNote = function (req, res, next) {
  const include = [{
    model: models.User,
    as: 'owner'
  }, {
    model: models.User,
    as: 'lastchangeuser'
  }]
  noteUtil.findNote(req, res, function (note) {
    // force to use short id
    const shortid = req.params.shortid
    if ((note.alias && shortid !== note.alias) || (!note.alias && shortid !== note.shortid)) {
      return res.redirect(config.serverURL + '/s/' + (note.alias || note.shortid))
    }
    note.increment('viewcount').then(function (note) {
      if (!note) {
        return errors.errorNotFound(res)
      }
      noteUtil.getPublishData(req, res, note, (data) => {
        res.set({
          'Cache-Control': 'private' // only cache by client
        })
        return res.render('pretty.ejs', data)
      })
    }).catch(function (err) {
      logger.error(err)
      return errors.errorInternalError(res)
    })
  }, include)
}

exports.showNote = function (req, res, next) {
  noteUtil.findNote(req, res, function (note) {
    // force to use note id
    const noteId = req.params.noteId
    const id = models.Note.encodeNoteId(note.id)
    if ((note.alias && noteId !== note.alias) || (!note.alias && noteId !== id)) {
      return res.redirect(config.serverURL + '/' + (note.alias || id))
    }
    const body = note.content
    const extracted = models.Note.extractMeta(body)
    const meta = models.Note.parseMeta(extracted.meta)
    let title = models.Note.decodeTitle(note.title)
    title = models.Note.generateWebTitle(meta.title || title)
    const opengraph = models.Note.parseOpengraph(meta, title)
    res.set({
      'Cache-Control': 'private', // only cache by client
      'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
    })
    return res.render('hedgedoc.ejs', {
      title,
      opengraph
    })
  }, null, true)
}

exports.createFromPOST = function (req, res, next) {
  let body = ''
  if (req.body && req.body.length > config.documentMaxLength) {
    return errors.errorTooLong(res)
  } else if (req.body) {
    body = req.body
  }
  body = body.replace(/[\r]/g, '')
  return noteUtil.newNote(req, res, body)
}

exports.doAction = function (req, res, next) {
  const noteId = req.params.noteId
  noteUtil.findNote(req, res, function (note) {
    const action = req.params.action
    switch (action) {
      case 'publish':
      case 'pretty': // pretty deprecated
        res.redirect(config.serverURL + '/s/' + (note.alias || note.shortid))
        break
      case 'slide':
        res.redirect(config.serverURL + '/p/' + (note.alias || note.shortid))
        break
      case 'download':
        exports.downloadMarkdown(req, res, note)
        break
      case 'info':
        noteActions.getInfo(req, res, note)
        break
      case 'gist':
        noteActions.createGist(req, res, note)
        break
      case 'revision':
        noteActions.getRevision(req, res, note)
        break
      default:
        return res.redirect(config.serverURL + '/' + noteId)
    }
  })
}

exports.downloadMarkdown = function (req, res, note) {
  const body = note.content
  let filename = models.Note.decodeTitle(note.title)
  filename = encodeURIComponent(filename)
  res.set({
    'Access-Control-Allow-Origin': '*', // allow CORS as API
    'Access-Control-Allow-Headers': 'Range',
    'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
    'Content-Type': 'text/markdown; charset=UTF-8',
    'Cache-Control': 'private',
    'Content-disposition': 'attachment; filename=' + filename + '.md',
    'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
  })
  res.send(body)
}
