'use strict'

const Router = require('express').Router
const { markdownParser } = require('../utils')

const router = module.exports = Router()

const noteController = require('./controller')
const slide = require('./slide')
const rateLimit = require('../middleware/rateLimit')
const config = require('../../config')

const applyRateLimitIfConfigured = (req, res, next) => {
  if (config.rateLimitNewNotes > 0) {
    return rateLimit.newNotes(req, res, next)
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
