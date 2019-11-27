'use strict'
// history
// external modules
var LZString = require('lz-string')

// core
var logger = require('./logger')
var models = require('./models')
const errors = require('./errors')

// public
var History = {
  historyGet: historyGet,
  historyPost: historyPost,
  historyDelete: historyDelete,
  updateHistory: updateHistory
}

function getHistory (userid, callback) {
  models.User.findOne({
    where: {
      id: userid
    }
  }).then(function (user) {
    if (!user) {
      return callback(null, null)
    }
    var history = {}
    if (user.history) {
      history = JSON.parse(user.history)
      // migrate LZString encoded note id to base64url encoded note id
      for (let i = 0, l = history.length; i < l; i++) {
        // Calculate minimal string length for an UUID that is encoded
        // base64 encoded and optimize comparsion by using -1
        // this should make a lot of LZ-String parsing errors obsolete
        // as we can assume that a nodeId that is 48 chars or longer is a
        // noteID.
        const base64UuidLength = ((4 * 36) / 3) - 1
        if (!(history[i].id.length > base64UuidLength)) {
          continue
        }
        try {
          let id = LZString.decompressFromBase64(history[i].id)
          if (id && models.Note.checkNoteIdValid(id)) {
            history[i].id = models.Note.encodeNoteId(id)
          }
        } catch (err) {
          // most error here comes from LZString, ignore
          if (err.message === 'Cannot read property \'charAt\' of undefined') {
            logger.warning('Looks like we can not decode "' + history[i].id + '" with LZString. Can be ignored.')
          } else {
            logger.error(err)
          }
        }
      }
      history = parseHistoryToObject(history)
    }
    logger.debug(`read history success: ${user.id}`)
    return callback(null, history)
  }).catch(function (err) {
    logger.error('read history failed: ' + err)
    return callback(err, null)
  })
}

function setHistory (userid, history, callback) {
  models.User.update({
    history: JSON.stringify(parseHistoryToArray(history))
  }, {
    where: {
      id: userid
    }
  }).then(function (count) {
    return callback(null, count)
  }).catch(function (err) {
    logger.error('set history failed: ' + err)
    return callback(err, null)
  })
}

function updateHistory (userid, noteId, document, time) {
  if (userid && noteId && typeof document !== 'undefined') {
    getHistory(userid, function (err, history) {
      if (err || !history) return
      if (!history[noteId]) {
        history[noteId] = {}
      }
      var noteHistory = history[noteId]
      var noteInfo = models.Note.parseNoteInfo(document)
      noteHistory.id = noteId
      noteHistory.text = noteInfo.title
      noteHistory.time = time || Date.now()
      noteHistory.tags = noteInfo.tags
      setHistory(userid, history, function (err, count) {
        if (err) {
          logger.log(err)
        }
      })
    })
  }
}

function parseHistoryToArray (history) {
  var _history = []
  Object.keys(history).forEach(function (key) {
    var item = history[key]
    _history.push(item)
  })
  return _history
}

function parseHistoryToObject (history) {
  var _history = {}
  for (var i = 0, l = history.length; i < l; i++) {
    var item = history[i]
    _history[item.id] = item
  }
  return _history
}

function historyGet (req, res) {
  if (req.isAuthenticated()) {
    getHistory(req.user.id, function (err, history) {
      if (err) return errors.errorInternalError(res)
      if (!history) return errors.errorNotFound(res)
      res.send({
        history: parseHistoryToArray(history)
      })
    })
  } else {
    return errors.errorForbidden(res)
  }
}

function historyPost (req, res) {
  if (req.isAuthenticated()) {
    var noteId = req.params.noteId
    if (!noteId) {
      if (typeof req.body['history'] === 'undefined') return errors.errorBadRequest(res)
      logger.debug(`SERVER received history from [${req.user.id}]: ${req.body.history}`)
      try {
        var history = JSON.parse(req.body.history)
      } catch (err) {
        return errors.errorBadRequest(res)
      }
      if (Array.isArray(history)) {
        setHistory(req.user.id, history, function (err, count) {
          if (err) return errors.errorInternalError(res)
          res.end()
        })
      } else {
        return errors.errorBadRequest(res)
      }
    } else {
      if (typeof req.body['pinned'] === 'undefined') return errors.errorBadRequest(res)
      getHistory(req.user.id, function (err, history) {
        if (err) return errors.errorInternalError(res)
        if (!history) return errors.errorNotFound(res)
        if (!history[noteId]) return errors.errorNotFound(res)
        if (req.body.pinned === 'true' || req.body.pinned === 'false') {
          history[noteId].pinned = (req.body.pinned === 'true')
          setHistory(req.user.id, history, function (err, count) {
            if (err) return errors.errorInternalError(res)
            res.end()
          })
        } else {
          return errors.errorBadRequest(res)
        }
      })
    }
  } else {
    return errors.errorForbidden(res)
  }
}

function historyDelete (req, res) {
  if (req.isAuthenticated()) {
    var noteId = req.params.noteId
    if (!noteId) {
      setHistory(req.user.id, [], function (err, count) {
        if (err) return errors.errorInternalError(res)
        res.end()
      })
    } else {
      getHistory(req.user.id, function (err, history) {
        if (err) return errors.errorInternalError(res)
        if (!history) return errors.errorNotFound(res)
        delete history[noteId]
        setHistory(req.user.id, history, function (err, count) {
          if (err) return errors.errorInternalError(res)
          res.end()
        })
      })
    }
  } else {
    return errors.errorForbidden(res)
  }
}

module.exports = History
