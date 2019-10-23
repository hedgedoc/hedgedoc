'use strict'

const Router = require('express').Router
const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy
const config = require('../../../config')
const { passportGeneralCallback } = require('../utils')

let googleAuth = module.exports = Router()

passport.use(new GoogleStrategy({
  clientID: config.get('google').clientID,
  clientSecret: config.get('google').clientSecret,
  callbackURL: config.get('serverURL') + '/auth/google/callback',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
}, passportGeneralCallback))

googleAuth.get('/auth/google', function (req, res, next) {
  passport.authenticate('google', { scope: ['profile'] })(req, res, next)
})
// google auth callback
googleAuth.get('/auth/google/callback',
  passport.authenticate('google', {
    successReturnToOrRedirect: config.get('serverURL') + '/',
    failureRedirect: config.get('serverURL') + '/'
  })
)
