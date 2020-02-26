import {markdownParser} from "../utils";

import {SlideController} from "./slide";
import {NoteController} from "./controller";
import {Router} from "express";

const router = module.exports = Router();
// get new note
router.get('/new', NoteController.createFromPOST);
// post new note with content
router.post('/new', markdownParser, NoteController.createFromPOST);
// post new note with content and alias
router.post('/new/:noteId', markdownParser, NoteController.createFromPOST);
// get publish note
router.get('/s/:shortid', NoteController.showPublishNote);
// publish note actions
router.get('/s/:shortid/:action', NoteController.publishNoteActions);
// get publish slide
router.get('/p/:shortid', SlideController.showPublishSlide);
// publish slide actions
router.get('/p/:shortid/:action', SlideController.publishSlideActions);
// get note by id
router.get('/:noteId', NoteController.showNote);
// note actions
router.get('/:noteId/:action', NoteController.doAction);
// note actions with action id
router.get('/:noteId/:action/:actionId', NoteController.doAction);
