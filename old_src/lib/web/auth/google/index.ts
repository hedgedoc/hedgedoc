import { Router } from 'express'
import passport from 'passport'
import * as Google from 'passport-google-oauth20'
import { config } from '../../../config'
import { AuthMiddleware } from '../interface'
import { passportGeneralCallback } from '../utils'

const googleAuth = Router()

export const GoogleMiddleware: AuthMiddleware = {
  getMiddleware: function (): Router {
    passport.use(new Google.Strategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.serverURL + '/auth/google/callback',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    }, (
      accessToken: string,
      refreshToken: string,
      profile,
      done) => {
      /*
       This ugly hack is neccessary, because the Google Strategy wants a done-callback with an err as Error | null | undefined
       but the passportGeneralCallback (and every other PassportStrategy) want a done-callback with err as string | Error | undefined
       Note the absence of null. The lambda converts all `null` to `undefined`.
      */
      passportGeneralCallback(accessToken, refreshToken, profile, (err?, user?) => {
        done(err === null ? undefined : err, user)
      })
    }))

    googleAuth.get('/auth/google', function (req, res, next) {
      const authOpts = { scope: ['profile'], hostedDomain: config.google.hostedDomain }
      passport.authenticate('google', authOpts)(req, res, next)
    })
    googleAuth.get('/auth/google/callback',
      passport.authenticate('google', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )
    return googleAuth
  }
}
