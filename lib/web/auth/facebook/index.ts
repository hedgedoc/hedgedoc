import passport from 'passport'
import { config } from '../../../config'
import { AuthMiddleware } from '../interface'
import { Router } from 'express'
import { passportGeneralCallback } from '../utils'
import { Strategy as FacebookStrategy } from 'passport-facebook'

export const FacebookMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    const facebookAuth = Router()
    passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.serverURL + '/auth/facebook/callback'
    }, passportGeneralCallback
    ))

    facebookAuth.get('/auth/facebook', function (req, res, next) {
      passport.authenticate('facebook')(req, res, next)
    })

    // facebook auth callback
    facebookAuth.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )
    return facebookAuth
  }
}
