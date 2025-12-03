'use strict'

const Router = require('express').Router
const passport = require('passport')
const GithubStrategy = require('passport-github').Strategy
const config = require('../../../config')
const response = require('../../../response')
const { passportGeneralCallback } = require('../utils')

const githubAuth = module.exports = Router()

passport.use(new GithubStrategy({
  clientID: config.github.clientID,
  clientSecret: config.github.clientSecret,
  callbackURL: config.serverURL + '/auth/github/callback',
  pkce: true,
  state: true
}, passportGeneralCallback))

githubAuth.get('/auth/github', function (req, res, next) {
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
