'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import { markdownParser } from '../utils'

const router = Router()

import noteController = require('./controller')
import slide = require('./slide')
import rateLimit = require('../middleware/rateLimit')
import config = require('../../config')

const applyRateLimitIfConfigured = (req: Request, res: Response, next: NextFunction): void => {
  if (config.rateLimitNewNotes > 0) {
    rateLimit.newNotes(req, res, next)
    return
  }
  next()
}

// get new note
router.get('/new', applyRateLimitIfConfigured, noteController.createFromPOST)
// post new note with content
router.post('/new', applyRateLimitIfConfigured, markdownParser, noteController.createFromPOST)
// post new note with content and alias
router.post('/new/:noteId', applyRateLimitIfConfigured, markdownParser, noteController.createFromPOST)
// get publish note
router.get('/s/:shortid', noteController.showPublishNote)
// publish note actions
router.get('/s/:shortid/:action', noteController.publishNoteActions)
// get publish slide
router.get('/p/:shortid', slide.showPublishSlide)
// publish slide actions
router.get('/p/:shortid/:action', slide.publishSlideActions)
// get note by id
router.get('/:noteId', noteController.showNote)
// note actions
router.get('/:noteId/:action', noteController.doAction)
// note actions with action id
router.get('/:noteId/:action/:actionId', noteController.doAction)

export = router
