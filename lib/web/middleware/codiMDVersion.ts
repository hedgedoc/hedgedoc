import { config } from '../../config'
import { NextFunction, Request, Response } from 'express'

export default function version (req: Request, res: Response, next: NextFunction) {
  res.set({
    'CodiMD-Version': config.version
  })
  return next()
}
