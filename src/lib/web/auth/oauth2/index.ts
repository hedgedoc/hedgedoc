import { Router } from 'express'
import passport from 'passport'

import { OAuth2CustomStrategy } from './oauth2-custom-strategy'
import { config } from '../../../config'
import { passportGeneralCallback } from '../utils'
import { AuthMiddleware } from '../interface'

export const OAuth2Middleware: AuthMiddleware = {
  getMiddleware (): Router {
    const OAuth2Auth = Router()

    passport.use(new OAuth2CustomStrategy({
      authorizationURL: config.oauth2.authorizationURL,
      tokenURL: config.oauth2.tokenURL,
      clientID: config.oauth2.clientID,
      clientSecret: config.oauth2.clientSecret,
      callbackURL: config.serverURL + '/auth/oauth2/callback',
      userProfileURL: config.oauth2.userProfileURL,
      scope: config.oauth2.scope,
      state: true
    }, passportGeneralCallback))

    OAuth2Auth.get('/auth/oauth2', passport.authenticate('oauth2'))

    // github auth callback
    OAuth2Auth.get('/auth/oauth2/callback',
      passport.authenticate('oauth2', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )

    return OAuth2Auth
  }
}
