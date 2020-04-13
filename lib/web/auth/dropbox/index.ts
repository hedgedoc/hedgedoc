import { NextFunction, Request, Response, Router } from 'express'
import passport from 'passport'
import * as DropboxStrategy from 'passport-dropbox-oauth2'
import { config } from '../../../config'
import { AuthMiddleware } from '../interface'
import { passportGeneralCallback } from '../utils'

export const dropboxAuth = Router()

export const DropboxMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    passport.use(new DropboxStrategy({
      apiVersion: '2',
      clientID: config.dropbox.clientID,
      clientSecret: config.dropbox.clientSecret,
      callbackURL: config.serverURL + '/auth/dropbox/callback'
    }, passportGeneralCallback))

    dropboxAuth.get('/auth/dropbox', function (req: Request, res: Response, next: NextFunction) {
      passport.authenticate('dropbox-oauth2')(req, res, next)
    })
    dropboxAuth.get('/auth/dropbox/callback',
      passport.authenticate('dropbox-oauth2', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )
    return dropboxAuth
  }
}
