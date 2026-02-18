import type { Request, Response } from 'express'
import config = require('./config')

function responseError (res: Response, code: number, detail: string, msg: string): void {
  res.status(code).render('error.ejs', {
    title: code + ' ' + detail + ' ' + msg,
    code,
    detail,
    msg,
    opengraph: []
  })
}

export function errorForbidden (res: Response): void {
  const req: Request = res.req
  if ((req as any).user) {
    responseError(res, 403, 'Forbidden', 'oh no.')
  } else {
    if (!(req as any).session) (req as any).session = {}
    if (req.originalUrl !== '/403') {
      (req as any).session.returnTo = config.serverURL + (req.originalUrl || '/')
      ;(req as any).flash('error', 'You are not allowed to access this page. Maybe try logging in?')
    }
    res.redirect(config.serverURL + '/')
  }
}

export function errorNotFound (res: Response): void {
  responseError(res, 404, 'Not Found', 'oops.')
}

export function errorBadRequest (res: Response): void {
  responseError(res, 400, 'Bad Request', 'something not right.')
}

export function errorConflict (res: Response): void {
  responseError(res, 409, 'Conflict', 'This note already exists.')
}

export function errorTooLong (res: Response): void {
  responseError(res, 413, 'Payload Too Large', 'Shorten your note!')
}

export function errorTooManyRequests (res: Response): void {
  responseError(res, 429, 'Too Many Requests', 'Try again later.')
}

export function errorInternalError (res: Response): void {
  responseError(res, 500, 'Internal Error', 'wtf.')
}

export function errorServiceUnavailable (res: Response): void {
  res.status(503).send('I\'m busy right now, try again later.')
}
