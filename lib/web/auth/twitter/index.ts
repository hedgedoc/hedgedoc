'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

import config = require('../../../config')
import { passportGeneralCallback } from '../utils'

const twitterAuth = Router()

passport.use(new TwitterStrategy({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackURL: config.serverURL + '/auth/twitter/callback'
}, passportGeneralCallback))

twitterAuth.get('/auth/twitter', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('twitter')(req, res, next)
})

// twitter auth callback
twitterAuth.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

export = twitterAuth
