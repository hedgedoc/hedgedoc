'use strict'

import type { Request, Response } from 'express'
// history
// external modules
import LZString = require('lz-string')
// core
import logger = require('./logger')
import models = require('./models')
import * as errors from './errors'

interface HistoryItem {
  id: string
  text?: string
  time?: number
  tags?: string[]
  pinned?: boolean
}

function getHistory (userid: string, callback: (err: Error | null, history: Record<string, HistoryItem> | null) => void): void {
  models.User.findOne({
    where: {
      id: userid
    }
  }).then(function (user: any) {
    if (!user) {
      return callback(null, null)
    }
    let historyObj: Record<string, HistoryItem> = {}
    if (user.history) {
      const historyArr: HistoryItem[] = JSON.parse(user.history)
      // migrate LZString encoded note id to base64url encoded note id
      for (let i = 0, l = historyArr.length; i < l; i++) {
        // Calculate minimal string length for an UUID that is encoded
        // base64 encoded and optimize comparsion by using -1
        // this should make a lot of LZ-String parsing errors obsolete
        // as we can assume that a nodeId that is 48 chars or longer is a
        // noteID.
        const base64UuidLength = ((4 * 36) / 3) - 1
        if (!(historyArr[i].id.length > base64UuidLength)) {
          continue
        }
        try {
          const id = LZString.decompressFromBase64(historyArr[i].id)
          if (id && models.Note.checkNoteIdValid(id)) {
            historyArr[i].id = models.Note.encodeNoteId(id)
          }
        } catch (err: any) {
          // most error here comes from LZString, ignore
          if (err.message === 'Cannot read property \'charAt\' of undefined') {
            logger.warn('Looks like we can not decode "' + historyArr[i].id + '" with LZString. Can be ignored.')
          } else {
            logger.error(err)
          }
        }
      }
      historyObj = parseHistoryToObject(historyArr)
    }
    logger.debug(`read history success: ${user.id}`)
    return callback(null, historyObj)
  }).catch(function (err: Error) {
    logger.error('read history failed: ' + err)
    return callback(err, null)
  })
}

function setHistory (userid: string, history: Record<string, HistoryItem> | HistoryItem[], callback: (err: Error | null, count: number[] | null) => void): void {
  models.User.update({
    history: JSON.stringify(parseHistoryToArray(history))
  }, {
    where: {
      id: userid
    }
  }).then(function (count: number[]) {
    return callback(null, count)
  }).catch(function (err: Error) {
    logger.error('set history failed: ' + err)
    return callback(err, null)
  })
}

function updateHistory (userid: string, noteId: string, document: any, time?: number): void {
  if (userid && noteId && typeof document !== 'undefined') {
    getHistory(userid, function (err, history) {
      if (err || !history) return
      if (!history[noteId]) {
        history[noteId] = { id: noteId }
      }
      const noteHistory = history[noteId]
      const noteInfo = models.Note.parseNoteInfo(document)
      noteHistory.id = noteId
      noteHistory.text = noteInfo.title
      noteHistory.time = time || Date.now()
      noteHistory.tags = noteInfo.tags
      setHistory(userid, history, function (err, _count) {
        if (err) {
          logger.error('set history error:', err)
        }
      })
    })
  }
}

function parseHistoryToArray (history: Record<string, HistoryItem> | HistoryItem[]): HistoryItem[] {
  const _history: HistoryItem[] = []
  Object.keys(history).forEach(function (key) {
    const item = (history as Record<string, HistoryItem>)[key]
    _history.push(item)
  })
  return _history
}

function parseHistoryToObject (history: HistoryItem[]): Record<string, HistoryItem> {
  const _history: Record<string, HistoryItem> = {}
  for (let i = 0, l = history.length; i < l; i++) {
    const item = history[i]
    _history[item.id] = item
  }
  return _history
}

function historyGet (req: Request, res: Response): void {
  if (req.isAuthenticated()) {
    getHistory((req as any).user.id, function (err, history) {
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

function historyPost (req: Request, res: Response): void {
  if (req.isAuthenticated()) {
    const noteId: string = req.params.noteId as string
    if (!noteId) {
      if (typeof req.body.history === 'undefined') return errors.errorBadRequest(res)
      logger.debug(`SERVER received history from [${(req as any).user.id}]: ${req.body.history}`)
      try {
        const history = JSON.parse(req.body.history)
        if (Array.isArray(history)) {
          setHistory((req as any).user.id, history, function (err, _count) {
            if (err) return errors.errorInternalError(res)
            res.end()
          })
        } else {
          return errors.errorBadRequest(res)
        }
      } catch (err) {
        return errors.errorBadRequest(res)
      }
    } else {
      if (typeof req.body.pinned === 'undefined') return errors.errorBadRequest(res)
      getHistory((req as any).user.id, function (err, history) {
        if (err) return errors.errorInternalError(res)
        if (!history) return errors.errorNotFound(res)
        if (!history[noteId]) return errors.errorNotFound(res)
        if (req.body.pinned === 'true' || req.body.pinned === 'false') {
          history[noteId].pinned = (req.body.pinned === 'true')
          setHistory((req as any).user.id, history, function (err, _count) {
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

function historyDelete (req: Request, res: Response): void {
  if (!req.isAuthenticated()) {
    return errors.errorForbidden(res)
  }

  const token = req.query.token
  if (!token || token !== (req as any).user.deleteToken) {
    return errors.errorForbidden(res)
  }

  const noteId: string = req.params.noteId as string
  if (!noteId) {
    setHistory((req as any).user.id, [], function (err, _count) {
      if (err) return errors.errorInternalError(res)
      res.end()
    })
  } else {
    getHistory((req as any).user.id, function (err, history) {
      if (err) return errors.errorInternalError(res)
      if (!history) return errors.errorNotFound(res)
      delete history[noteId]
      setHistory((req as any).user.id, history, function (err, _count) {
        if (err) return errors.errorInternalError(res)
        res.end()
      })
    })
  }
}

// public
const History = {
  historyGet,
  historyPost,
  historyDelete,
  updateHistory
}

export = History
