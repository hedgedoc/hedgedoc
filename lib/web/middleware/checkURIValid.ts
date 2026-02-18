'use strict'

import type { Request, Response, NextFunction } from 'express'
import logger = require('../../logger')
import * as errors from '../../errors'

const checkURIValid = function (req: Request, res: Response, next: NextFunction): void {
  try {
    decodeURIComponent(req.path)
  } catch (err) {
    logger.error(err)
    return errors.errorBadRequest(res)
  }
  next()
}

export = checkURIValid
