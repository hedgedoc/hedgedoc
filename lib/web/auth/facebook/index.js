'use strict'

const Router = require('express').Router
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const config = require('../../../config')
const { passportGeneralCallback } = require('../utils')

let facebookAuth = module.exports = Router()

passport.use(new FacebookStrategy({
  clientID: config.get('facebook').clientID,
  clientSecret: config.get('facebook').clientSecret,
  callbackURL: config.get('serverURL') + '/auth/facebook/callback'
}, passportGeneralCallback))

facebookAuth.get('/auth/facebook', function (req, res, next) {
  passport.authenticate('facebook')(req, res, next)
})

// facebook auth callback
facebookAuth.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successReturnToOrRedirect: config.get('serverURL') + '/',
    failureRedirect: config.get('serverURL') + '/'
  })
)
