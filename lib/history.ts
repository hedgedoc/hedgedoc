'use strict'
// history
// external modules
import LZString from 'lz-string'

// core
import { logger } from './logger'
import { Note, User } from './models'
import errors from './errors'

// public

type HistoryObject = {
  id: string;
  text: string;
  time: number;
  tags: string[];
}

function parseHistoryMapToArray (historyMap: Map<string, HistoryObject>): HistoryObject[] {
  const historyArray: HistoryObject[] = []
  for (const [, value] of historyMap) {
    historyArray.push(value)
  }
  return historyArray
}

function parseHistoryArrayToMap (historyArray: HistoryObject[]): Map<string, HistoryObject> {
  const historyMap = new Map()
  for (let i = 0; i < historyArray.length; i++) {
    const item = historyArray[i]
    historyMap.set(item.id, item)
  }
  return historyMap
}

function getHistory (userId, callback: (err: any, history: any) => void): void {
  User.findOne({
    where: {
      id: userId
    }
  }).then(function (user) {
    if (!user) {
      return callback(null, null)
    }
    let history
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
          const id = LZString.decompressFromBase64(history[i].id)
          if (id && Note.checkNoteIdValid(id)) {
            history[i].id = Note.encodeNoteId(id)
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
      history = parseHistoryArrayToMap(history)
    }
    logger.debug(`read history success: ${user.id}`)
    return callback(null, history)
  }).catch(function (err) {
    logger.error('read history failed: ' + err)
    return callback(err, null)
  })
}

function setHistory (userId: string, history: any, callback: (err: any | null, count: [number, User[]] | null) => void): void {
  User.update({
    history: JSON.stringify(parseHistoryMapToArray(history))
  }, {
    where: {
      id: userId
    }
  }).then(function (count) {
    return callback(null, count)
  }).catch(function (err) {
    logger.error('set history failed: ' + err)
    return callback(err, null)
  })
}

function updateHistory (userId: string, noteId: string, document, time): void {
  if (userId && noteId && typeof document !== 'undefined') {
    getHistory(userId, function (err, history) {
      if (err || !history) return
      if (!history[noteId]) {
        history[noteId] = {}
      }
      const noteHistory = history[noteId]
      const noteInfo = Note.parseNoteInfo(document)
      noteHistory.id = noteId
      noteHistory.text = noteInfo.title
      noteHistory.time = time || Date.now()
      noteHistory.tags = noteInfo.tags
      setHistory(userId, history, function (err, _) {
        if (err) {
          logger.log(err)
        }
      })
    })
  }
}

function historyGet (req, res): any {
  if (req.isAuthenticated()) {
    getHistory(req.user.id, function (err, history) {
      if (err) return errors.errorInternalError(res)
      if (!history) return errors.errorNotFound(res)
      res.send({
        history: parseHistoryMapToArray(history)
      })
    })
  } else {
    return errors.errorForbidden(res)
  }
}

function historyPost (req, res): any {
  if (req.isAuthenticated()) {
    const noteId = req.params.noteId
    if (!noteId) {
      if (typeof req.body.history === 'undefined') return errors.errorBadRequest(res)
      logger.debug(`SERVER received history from [${req.user.id}]: ${req.body.history}`)
      let history
      try {
        history = JSON.parse(req.body.history)
      } catch (err) {
        return errors.errorBadRequest(res)
      }
      if (Array.isArray(history)) {
        setHistory(req.user.id, history, function (err, _) {
          if (err) return errors.errorInternalError(res)
          res.end()
        })
      } else {
        return errors.errorBadRequest(res)
      }
    } else {
      if (typeof req.body.pinned === 'undefined') return errors.errorBadRequest(res)
      getHistory(req.user.id, function (err, history) {
        if (err) return errors.errorInternalError(res)
        if (!history) return errors.errorNotFound(res)
        if (!history[noteId]) return errors.errorNotFound(res)
        if (req.body.pinned === 'true' || req.body.pinned === 'false') {
          history[noteId].pinned = (req.body.pinned === 'true')
          setHistory(req.user.id, history, function (err, _) {
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

function historyDelete (req, res): any {
  if (req.isAuthenticated()) {
    const noteId = req.params.noteId
    if (!noteId) {
      setHistory(req.user.id, [], function (err, _) {
        if (err) return errors.errorInternalError(res)
        res.end()
      })
    } else {
      getHistory(req.user.id, function (err, history) {
        if (err) return errors.errorInternalError(res)
        if (!history) return errors.errorNotFound(res)
        delete history[noteId]
        setHistory(req.user.id, history, function (err, _) {
          if (err) return errors.errorInternalError(res)
          res.end()
        })
      })
    }
  } else {
    return errors.errorForbidden(res)
  }
}

const History = {
  historyGet: historyGet,
  historyPost: historyPost,
  historyDelete: historyDelete,
  updateHistory: updateHistory
}

export { History, HistoryObject }
