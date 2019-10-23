'use strict'

const Router = require('express').Router
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy

const config = require('../../../config')
const { passportGeneralCallback } = require('../utils')

let twitterAuth = module.exports = Router()

passport.use(new TwitterStrategy({
  consumerKey: config.get('twitter').consumerKey,
  consumerSecret: config.get('twitter').consumerSecret,
  callbackURL: config.get('serverURL') + '/auth/twitter/callback'
}, passportGeneralCallback))

twitterAuth.get('/auth/twitter', function (req, res, next) {
  passport.authenticate('twitter')(req, res, next)
})

// twitter auth callback
twitterAuth.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successReturnToOrRedirect: config.get('serverURL') + '/',
    failureRedirect: config.get('serverURL') + '/'
  })
)
