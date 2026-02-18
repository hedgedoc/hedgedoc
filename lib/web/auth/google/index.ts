'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
import config = require('../../../config')
import { passportGeneralCallback } from '../utils'

const googleAuth = Router()

passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: config.serverURL + '/auth/google/callback',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  pkce: true,
  state: true
}, passportGeneralCallback))

googleAuth.get('/auth/google', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('google', { scope: ['profile'], hostedDomain: config.google.hostedDomain })(req, res, next)
})
// google auth callback
googleAuth.get('/auth/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

export = googleAuth
