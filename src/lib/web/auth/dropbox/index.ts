import { NextFunction, Request, Response, Router } from 'express'
import passport from 'passport'
import { Strategy as DropboxStrategy } from 'passport-dropbox-oauth2'
import { config } from '../../../config'
import { User } from '../../../models'
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
    }, (
      accessToken: string,
      refreshToken: string,
      profile,
      done: (err?: Error | null, user?: User) => void
    ): void => {
      // the Dropbox plugin wraps the email addresses in an object
      // see https://github.com/florianheinemann/passport-dropbox-oauth2/blob/master/lib/passport-dropbox-oauth2/strategy.js#L146
      profile.emails = profile.emails.map(element => element.value)
      passportGeneralCallback(accessToken, refreshToken, profile, done)
    }))

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
