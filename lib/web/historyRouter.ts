import { urlencodedParser } from './utils'
import { History } from '../history'

const Router = require('express').Router
const historyRouter = module.exports = Router()

// get history
historyRouter.get('/history', History.historyGet)
// post history
historyRouter.post('/history', urlencodedParser, History.historyPost)
// post history by note id
historyRouter.post('/history/:noteId', urlencodedParser, History.historyPost)
// delete history
historyRouter.delete('/history', History.historyDelete)
// delete history by note id
historyRouter.delete('/history/:noteId', History.historyDelete)
