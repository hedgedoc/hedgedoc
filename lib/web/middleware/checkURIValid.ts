import { logger } from '../../logger'
import { errors } from '../../errors'
import { NextFunction, Request, Response } from 'express'

export default function checkURI (req: Request, res: Response, next: NextFunction) {
  try {
    decodeURIComponent(req.path)
    next()
  } catch (err) {
    logger.error(err)
    errors.errorBadRequest(res)
  }
}
