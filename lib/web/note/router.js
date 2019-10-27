'use strict'

const Router = require('express').Router

const response = require('../../response')

const { markdownParser } = require('../utils')

const router = module.exports = Router()

const noteActions = require('./actions')
const slide = require('./slide')

// get new note
router.get('/new', response.postNote)
// post new note with content
router.post('/new', markdownParser, response.postNote)
// post new note with content and alias
router.post('/new/:noteId', markdownParser, response.postNote)
// get publish note
router.get('/s/:shortid', response.showPublishNote)
// publish note actions
router.get('/s/:shortid/:action', response.publishNoteActions)
// get publish slide
router.get('/p/:shortid', slide.showPublishSlide)
// publish slide actions
router.get('/p/:shortid/:action', slide.publishSlideActions)
// get note by id
router.get('/:noteId', response.showNote)
// note actions
router.get('/:noteId/:action', noteActions.doAction)
// note actions with action id
router.get('/:noteId/:action/:actionId', noteActions.doAction)
