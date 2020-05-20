import { config } from '../../config'
import { NextFunction, Request, Response } from 'express'

export function codiMDVersion (req: Request, res: Response, next: NextFunction): void {
  res.set({
    'CodiMD-Version': config.version
  })
  return next()
}
