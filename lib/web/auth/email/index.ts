'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
import validator = require('validator')
const LocalStrategy = require('passport-local').Strategy
import config = require('../../../config')
import models = require('../../../models')
import logger = require('../../../logger')
import { urlencodedParser } from '../../utils'
import * as errors from '../../../errors'
import rateLimit = require('../../middleware/rateLimit')

const emailAuth = Router()

passport.use(new LocalStrategy({
  usernameField: 'email'
}, function (email: string, password: string, done: Function) {
  if (!validator.isEmail(email)) return done(null, false)
  models.User.findOne({
    where: {
      email
    }
  }).then(function (user: any) {
    if (!user) return done(null, false)
    user.verifyPassword(password).then((verified: boolean) => {
      if (verified) {
        return done(null, user)
      } else {
        logger.warn('invalid password given for %s', user.email)
        return done(null, false)
      }
    })
  }).catch(function (err: any) {
    logger.error(err)
    return done(err)
  })
}))

if (config.allowEmailRegister) {
  emailAuth.post('/register', rateLimit.userEndpoints, urlencodedParser, function (req: Request, res: Response, next: NextFunction) {
    if (!req.body.email || !req.body.password) return errors.errorBadRequest(res)
    if (!validator.isEmail(req.body.email)) return errors.errorBadRequest(res)
    models.User.findOrCreate({
      where: {
        email: req.body.email
      },
      defaults: {
        password: req.body.password
      }
    }).spread(function (user: any, created: boolean) {
      if (user && created) {
        logger.debug('user registered: ' + user.id)
        ;(req as any).flash('info', "You've successfully registered, please sign in.")
        return res.redirect(config.serverURL + '/')
      }
      logger.debug('registration failed. user: ', user)
      ;(req as any).flash('error', 'Failed to register your account.')
      return res.redirect(config.serverURL + '/')
    }).catch(function (err: any) {
      logger.error('auth callback failed: ' + err)
      return errors.errorInternalError(res)
    })
  })
}

emailAuth.post('/login', rateLimit.userEndpoints, urlencodedParser, function (req: Request, res: Response, next: NextFunction) {
  if (!req.body.email || !req.body.password) return errors.errorBadRequest(res)
  if (!validator.isEmail(req.body.email)) return errors.errorBadRequest(res)
  passport.authenticate('local', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/',
    failureFlash: 'Invalid email or password.'
  })(req, res, next)
})

export = emailAuth
