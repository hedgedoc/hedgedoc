'use strict'

import type { Request, Response, NextFunction } from 'express'
import toobusy = require('toobusy-js')
import * as errors from '../../errors'
import config = require('../../config')

toobusy.maxLag(config.tooBusyLag)

const tooBusyMiddleware = function (req: Request, res: Response, next: NextFunction): void {
  // We dont want to return "toobusy" errors for healthchecks, as that
  // will cause the process to be restarted
  if (req.baseUrl === '/_health') {
    return next()
  }
  if (toobusy()) {
    errors.errorServiceUnavailable(res)
  } else {
    next()
  }
}

export = tooBusyMiddleware
