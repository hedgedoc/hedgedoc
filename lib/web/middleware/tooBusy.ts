import toobusy from 'toobusy-js'
import { errors } from '../../errors'
import { config } from '../../config'
import { NextFunction, Request, Response } from 'express'

toobusy.maxLag(config.tooBusyLag)

export function tooBusy (req: Request, res: Response, next: NextFunction): void {
  if (toobusy()) {
    errors.errorServiceUnavailable(res)
  } else {
    next()
  }
}
