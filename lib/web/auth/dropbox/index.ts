'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const DropboxStrategy = require('passport-dropbox-oauth2').Strategy
import config = require('../../../config')
import { passportGeneralCallback } from '../utils'

const dropboxAuth = Router()

passport.use(new DropboxStrategy({
  apiVersion: '2',
  clientID: config.dropbox.clientID,
  clientSecret: config.dropbox.clientSecret,
  callbackURL: config.serverURL + '/auth/dropbox/callback',
  state: true,
  pkce: true
}, passportGeneralCallback))

dropboxAuth.get('/auth/dropbox', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('dropbox-oauth2')(req, res, next)
})

// dropbox auth callback
dropboxAuth.get('/auth/dropbox/callback',
  passport.authenticate('dropbox-oauth2', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

export = dropboxAuth
