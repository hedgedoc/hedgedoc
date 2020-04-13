import { Router } from 'express'
import passport from 'passport'
import { Strategy as TwitterStrategy } from 'passport-twitter'

import { config } from '../../../config'
import { passportGeneralCallback } from '../utils'
import { AuthMiddleware } from '../interface'

export const TwitterMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    const TwitterAuth = Router()

    passport.use(new TwitterStrategy({
      consumerKey: config.twitter.consumerKey,
      consumerSecret: config.twitter.consumerSecret,
      callbackURL: config.serverURL + '/auth/twitter/callback'
    }, passportGeneralCallback))

    TwitterAuth.get('/auth/twitter', function (req, res, next) {
      passport.authenticate('twitter')(req, res, next)
    })

    // twitter auth callback
    TwitterAuth.get('/auth/twitter/callback',
      passport.authenticate('twitter', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )

    return TwitterAuth
  }
}
