'use strict'

import type { Request, Response, NextFunction } from 'express'
import { rateLimit } from 'express-rate-limit'
import * as errors from '../../errors'
import config = require('../../config')

const determineKey = (req: Request): string => {
  if ((req as any).user) {
    return (req as any).user.id
  }
  return req.header('cf-connecting-ip') || req.ip || 'unknown'
}

// limits requests to user endpoints (login, signup) to 10 requests per 5 minutes
export const userEndpoints = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  keyGenerator: determineKey,
  handler: (_req: Request, res: Response) => errors.errorTooManyRequests(res)
})

// limits the amount of requests to the new note endpoint per 5 minutes based on configuration
export const newNotes = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: config.rateLimitNewNotes,
  keyGenerator: determineKey,
  handler: (_req: Request, res: Response) => errors.errorTooManyRequests(res)
})
