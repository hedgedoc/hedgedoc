'use strict'

import type { Request, Response } from 'express'
import { Router } from 'express'
import response = require('../response')
import * as errors from '../errors'

const baseRouter = Router()

// get index
baseRouter.get('/', response.showIndex)
// get 403 forbidden
baseRouter.get('/403', function (_req: Request, res: Response) {
  errors.errorForbidden(res)
})
// get 404 not found
baseRouter.get('/404', function (_req: Request, res: Response) {
  errors.errorNotFound(res)
})
// get 500 internal error
baseRouter.get('/500', function (_req: Request, res: Response) {
  errors.errorInternalError(res)
})

export = baseRouter
