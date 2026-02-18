'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

import config = require('../../../config')
import { passportGeneralCallback } from '../utils'

const facebookAuth = Router()

passport.use(new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.serverURL + '/auth/facebook/callback',
  state: true,
  pkce: true
}, passportGeneralCallback))

facebookAuth.get('/auth/facebook', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('facebook')(req, res, next)
})

// facebook auth callback
facebookAuth.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

export = facebookAuth
