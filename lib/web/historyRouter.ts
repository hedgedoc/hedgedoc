import { urlencodedParser } from './utils'
import { History } from '../history'
import { Router } from 'express'

const HistoryRouter = Router()

// get history
HistoryRouter.get('/history', History.historyGet)
// post history
HistoryRouter.post('/history', urlencodedParser, History.historyPost)
// post history by note id
HistoryRouter.post('/history/:noteId', urlencodedParser, History.historyPost)
// delete history
HistoryRouter.delete('/history', History.historyDelete)
// delete history by note id
HistoryRouter.delete('/history/:noteId', History.historyDelete)

export { HistoryRouter }
