'use strict'

const Router = require('express').Router
const { markdownParser } = require('../utils')

const router = module.exports = Router()

const noteController = require('./controller')
const slide = require('./slide')

// get new note
router.get('/new', noteController.createFromPOST)
// post new note with content
router.post('/new', markdownParser, noteController.createFromPOST)
// post new note with content and alias
router.post('/new/:noteId', markdownParser, noteController.createFromPOST)
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
