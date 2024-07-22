'use strict'

const Router = require('express').Router
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

const config = require('../../../config')
const { passportGeneralCallback } = require('../utils')

const twitterAuth = module.exports = Router()

passport.use(new TwitterStrategy({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackURL: config.serverURL + '/auth/twitter/callback'
}, passportGeneralCallback))

twitterAuth.get('/auth/twitter', function (req, res, next) {
  passport.authenticate('twitter')(req, res, next)
})

// twitter auth callback
twitterAuth.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/',
    keepSessionInfo: true
  })
)
