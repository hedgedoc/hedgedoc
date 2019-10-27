const models = require('../../models')
const logger = require('../../logger')
const config = require('../../config')
const errors = require('../../errors')

exports.findNote = function (req, res, callback, include) {
  const id = req.params.noteId || req.params.shortid
  models.Note.parseNoteId(id, function (err, _id) {
    if (err) {
      logger.error(err)
      return errors.errorInternalError(res)
    }
    models.Note.findOne({
      where: {
        id: _id
      },
      include: include || null
    }).then(function (note) {
      if (!note) {
        return exports.newNote(req, res, null)
      }
      if (!exports.checkViewPermission(req, note)) {
        return errors.errorForbidden(res)
      } else {
        return callback(note)
      }
    }).catch(function (err) {
      logger.error(err)
      return errors.errorInternalError(res)
    })
  })
}

exports.checkViewPermission = function (req, note) {
  if (note.permission === 'private') {
    return !(!req.isAuthenticated() || note.ownerId !== req.user.id)
  } else if (note.permission === 'limited' || note.permission === 'protected') {
    return req.isAuthenticated()
  } else {
    return true
  }
}

exports.newNote = function (req, res, body) {
  let owner = null
  const noteId = req.params.noteId ? req.params.noteId : null
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
    logger.error(err)
    return errors.errorInternalError(res)
  })
}
