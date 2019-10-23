'use strict'

const Router = require('express').Router
const passport = require('passport')
const GitlabStrategy = require('passport-gitlab2').Strategy
const config = require('../../../config')
const response = require('../../../response')
const { passportGeneralCallback } = require('../utils')

let gitlabAuth = module.exports = Router()

passport.use(new GitlabStrategy({
  baseURL: config.get('gitlab').baseURL,
  clientID: config.get('gitlab').clientID,
  clientSecret: config.get('gitlab').clientSecret,
  scope: config.get('gitlab').scope,
  callbackURL: config.get('serverURL') + '/auth/gitlab/callback'
}, passportGeneralCallback))

gitlabAuth.get('/auth/gitlab', function (req, res, next) {
  passport.authenticate('gitlab')(req, res, next)
})

// gitlab auth callback
gitlabAuth.get('/auth/gitlab/callback',
  passport.authenticate('gitlab', {
    successReturnToOrRedirect: config.get('serverURL') + '/',
    failureRedirect: config.get('serverURL') + '/'
  })
)

if (!config.get('gitlab').scope || config.get('gitlab').scope === 'api') {
  // gitlab callback actions
  gitlabAuth.get('/auth/gitlab/callback/:noteId/:action', response.gitlabActions)
}
