import { Router } from 'express'
import { AuthMiddleware } from '../interface'
import passport from 'passport'
import * as Google from 'passport-google-oauth20'
import {config} from '../../../config'
import { passportGeneralCallback } from '../utils'

const googleAuth = Router()

export const GoogleMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    passport.use(new Google.Strategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.serverURL + '/auth/google/callback',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    }, passportGeneralCallback))

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
