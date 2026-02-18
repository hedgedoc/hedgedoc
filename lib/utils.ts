'use strict'

import type { Request, Response, NextFunction, RequestHandler } from 'express'

export function isSQLite (sequelize: any): boolean {
  return sequelize.options.dialect === 'sqlite'
}

export function isMySQL (sequelize: any): boolean {
  return ['mysql', 'mariadb'].includes(sequelize.options.dialect)
}

export function getImageMimeType (imagePath: string): string | undefined {
  const fileExtension = /[^.]+$/.exec(imagePath)

  if (!fileExtension) return undefined

  switch (fileExtension[0].toLowerCase()) {
    case 'bmp':
      return 'image/bmp'
    case 'gif':
      return 'image/gif'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'tiff':
      return 'image/tiff'
    case 'svg':
      return 'image/svg+xml'
    default:
      return undefined
  }
}

export function useUnless (paths: string[], middleware: RequestHandler): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    if (paths.includes(req.path)) {
      return next()
    }
    return middleware(req, res, next)
  }
}
