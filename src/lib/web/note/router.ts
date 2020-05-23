import { Router } from 'express'
import { markdownParser } from '../utils'
import * as NoteController from './controller'

import * as SlideController from './slide'

const NoteRouter = Router()
// get new note
NoteRouter.get('/new', NoteController.createFromPOST)
// post new note with content
NoteRouter.post('/new', markdownParser, NoteController.createFromPOST)
// post new note with content and alias
NoteRouter.post('/new/:noteId', markdownParser, NoteController.createFromPOST)
// get publish note
NoteRouter.get('/s/:shortid', NoteController.showPublishNote)
// publish note actions
NoteRouter.get('/s/:shortid/:action', NoteController.publishNoteActions)
// get publish slide
NoteRouter.get('/p/:shortid', SlideController.showPublishSlide)
// publish slide actions
NoteRouter.get('/p/:shortid/:action', SlideController.publishSlideActions)
// get note by id
NoteRouter.get('/:noteId', NoteController.showNote)
// note actions
NoteRouter.get('/:noteId/:action', NoteController.doAction)
// note actions with action id
NoteRouter.get('/:noteId/:action/:actionId', NoteController.doAction)

export { NoteRouter }
