'use strict'

const Router = require('express').Router
const passport = require('passport')
const DropboxStrategy = require('passport-dropbox-oauth2').Strategy
const config = require('../../../config')
const { passportGeneralCallback } = require('../utils')

let dropboxAuth = module.exports = Router()

passport.use(new DropboxStrategy({
  apiVersion: '2',
  clientID: config.get('dropbox').clientID,
  clientSecret: config.get('dropbox').clientSecret,
  callbackURL: config.get('serverURL') + '/auth/dropbox/callback'
}, passportGeneralCallback))

dropboxAuth.get('/auth/dropbox', function (req, res, next) {
  passport.authenticate('dropbox-oauth2')(req, res, next)
})

// dropbox auth callback
dropboxAuth.get('/auth/dropbox/callback',
  passport.authenticate('dropbox-oauth2', {
    successReturnToOrRedirect: config.get('serverURL') + '/',
    failureRedirect: config.get('serverURL') + '/'
  })
)
