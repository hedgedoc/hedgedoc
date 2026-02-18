'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const GitlabStrategy = require('passport-gitlab2').Strategy
import config = require('../../../config')
import response = require('../../../response')
import { passportGeneralCallback } from '../utils'

const gitlabAuth = Router()

passport.use(new GitlabStrategy({
  baseURL: config.gitlab.baseURL,
  clientID: config.gitlab.clientID,
  clientSecret: config.gitlab.clientSecret,
  scope: config.gitlab.scope,
  callbackURL: config.serverURL + '/auth/gitlab/callback',
  pkce: true,
  state: true
}, passportGeneralCallback))

gitlabAuth.get('/auth/gitlab', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('gitlab')(req, res, next)
})

// gitlab auth callback
gitlabAuth.get('/auth/gitlab/callback',
  passport.authenticate('gitlab', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

if (!config.gitlab.scope || config.gitlab.scope === 'api') {
  // gitlab callback actions
  gitlabAuth.get('/auth/gitlab/callback/:noteId/:action', response.gitlabActions)
}

export = gitlabAuth
