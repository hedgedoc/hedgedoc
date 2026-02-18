'use strict'

import type { Request, Response, NextFunction } from 'express'
import config = require('../../config')

const hedgeDocVersion = function (_req: Request, res: Response, next: NextFunction): void {
  res.set({
    'HedgeDoc-Version': config.version
  })
  return next()
}

export = hedgeDocVersion
