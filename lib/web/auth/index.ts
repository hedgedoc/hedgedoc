'use strict'

import type { Request, Response } from 'express'
import { Router } from 'express'
import passport = require('passport')

import config = require('../../config')
import logger = require('../../logger')
import models = require('../../models')

const authRouter = Router()

// serialize and deserialize
passport.serializeUser(function (user: any, done: Function) {
  logger.info('serializeUser: ' + user.id)
  return done(null, user.id)
})

passport.deserializeUser(function (id: string, done: Function) {
  models.User.findOne({
    where: {
      id
    }
  }).then(function (user: any) {
    // Don't die on non-existent user
    if (user == null) {
      return done(null, false, { message: 'Invalid UserID' })
    }

    logger.info('deserializeUser: ' + user.id)
    return done(null, user)
  }).catch(function (err: any) {
    logger.error(err)
    return done(err, null)
  })
})

if (config.isFacebookEnable) authRouter.use(require('./facebook'))
if (config.isTwitterEnable) authRouter.use(require('./twitter'))
if (config.isGitHubEnable) authRouter.use(require('./github'))
if (config.isGitLabEnable) authRouter.use(require('./gitlab'))
if (config.isMattermostEnable) authRouter.use(require('./mattermost'))
if (config.isDropboxEnable) authRouter.use(require('./dropbox'))
if (config.isGoogleEnable) authRouter.use(require('./google'))
if (config.isLDAPEnable) authRouter.use(require('./ldap'))
if (config.isSAMLEnable) authRouter.use(require('./saml'))
if (config.isOAuth2Enable) authRouter.use(require('./oauth2'))
if (config.isEmailEnable) authRouter.use(require('./email'))
if (config.isOpenIDEnable) authRouter.use(require('./openid'))

// logout
authRouter.get('/logout', function (req: Request, res: Response) {
  if (config.debug && req.isAuthenticated()) {
    logger.debug('user logout: ' + (req as any).user.id)
  }
  req.logout(() => {
    res.redirect(config.serverURL + '/')
  })
})

export = authRouter
