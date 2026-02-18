'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const Mattermost = require('mattermost')
const OAuthStrategy = require('passport-oauth2').Strategy
import config = require('../../../config')
import { passportGeneralCallback } from '../utils'

const mattermost = new Mattermost.Client()

const mattermostAuth = Router()

const mattermostStrategy = new OAuthStrategy({
  authorizationURL: config.mattermost.baseURL + '/oauth/authorize',
  tokenURL: config.mattermost.baseURL + '/oauth/access_token',
  clientID: config.mattermost.clientID,
  clientSecret: config.mattermost.clientSecret,
  callbackURL: config.serverURL + '/auth/mattermost/callback',
  state: true
}, passportGeneralCallback)

mattermostStrategy.userProfile = (accessToken: string, done: Function) => {
  mattermost.setUrl(config.mattermost.baseURL)
  mattermost.token = accessToken
  mattermost.useHeaderToken()
  mattermost.getMe(
    (data: any) => {
      done(null, data)
    },
    (err: any) => {
      done(err)
    }
  )
}

passport.use(mattermostStrategy)

mattermostAuth.get('/auth/mattermost', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('oauth2')(req, res, next)
})

// mattermost auth callback
mattermostAuth.get('/auth/mattermost/callback',
  passport.authenticate('oauth2', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

export = mattermostAuth
