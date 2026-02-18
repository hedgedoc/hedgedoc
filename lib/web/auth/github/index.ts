'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const GithubStrategy = require('passport-github').Strategy
import config = require('../../../config')
import response = require('../../../response')
import { passportGeneralCallback } from '../utils'

const githubAuth = Router()

passport.use(new GithubStrategy({
  clientID: config.github.clientID,
  clientSecret: config.github.clientSecret,
  callbackURL: config.serverURL + '/auth/github/callback',
  pkce: true,
  state: true
}, passportGeneralCallback))

githubAuth.get('/auth/github', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('github')(req, res, next)
})

// github auth callback
githubAuth.get('/auth/github/callback',
  passport.authenticate('github', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

// github callback actions
githubAuth.get('/auth/github/callback/:noteId/:action', response.githubActions)

export = githubAuth
