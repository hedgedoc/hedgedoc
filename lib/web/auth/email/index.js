'use strict'

const Router = require('express').Router
const passport = require('passport')
const validator = require('validator')
const LocalStrategy = require('passport-local').Strategy
const config = require('../../../config')
const models = require('../../../models')
const logger = require('../../../logger')
const { urlencodedParser } = require('../../utils')
const errors = require('../../../errors')
const rateLimit = require('../../middleware/rateLimit')

const emailAuth = module.exports = Router()

passport.use(new LocalStrategy({
  usernameField: 'email'
}, function (email, password, done) {
  if (!validator.isEmail(email)) return done(null, false)
  models.User.findOne({
    where: {
      email
    }
  }).then(function (user) {
    if (!user) return done(null, false)
    user.verifyPassword(password).then(verified => {
      if (verified) {
        return done(null, user)
      } else {
        logger.warn('invalid password given for %s', user.email)
        return done(null, false)
      }
    })
  }).catch(function (err) {
    logger.error(err)
    return done(err)
  })
}))

if (config.allowEmailRegister) {
  emailAuth.post('/register', rateLimit.userEndpoints, urlencodedParser, function (req, res, next) {
    if (!req.body.email || !req.body.password) return errors.errorBadRequest(res)
    if (!validator.isEmail(req.body.email)) return errors.errorBadRequest(res)
    models.User.findOrCreate({
      where: {
        email: req.body.email
      },
      defaults: {
        password: req.body.password
      }
    }).spread(function (user, created) {
      if (user && created) {
        logger.debug('user registered: ' + user.id)
        req.flash('info', "You've successfully registered, please sign in.")
        return res.redirect(config.serverURL + '/')
      }
      logger.debug('registration failed. user: ', user)
      req.flash('error', 'Failed to register your account.')
      return res.redirect(config.serverURL + '/')
    }).catch(function (err) {
      logger.error('auth callback failed: ' + err)
      return errors.errorInternalError(res)
    })
  })
}

emailAuth.post('/login', rateLimit.userEndpoints, urlencodedParser, function (req, res, next) {
  if (!req.body.email || !req.body.password) return errors.errorBadRequest(res)
  if (!validator.isEmail(req.body.email)) return errors.errorBadRequest(res)
  passport.authenticate('local', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/',
    failureFlash: 'Invalid email or password.'
  })(req, res, next)
})
