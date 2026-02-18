'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const OpenIDStrategy = require('@passport-next/passport-openid').Strategy
import config = require('../../../config')
import models = require('../../../models')
import logger = require('../../../logger')
import { urlencodedParser } from '../../utils'

const openIDAuth = Router()

passport.use(new OpenIDStrategy({
  returnURL: config.serverURL + '/auth/openid/callback',
  realm: config.serverURL,
  profile: true
}, function (openid: string, profile: any, done: Function) {
  const stringifiedProfile = JSON.stringify(profile)
  models.User.findOrCreate({
    where: {
      profileid: openid
    },
    defaults: {
      profile: stringifiedProfile
    }
  }).spread(function (user: any, created: boolean) {
    if (user) {
      let needSave = false
      if (user.profile !== stringifiedProfile) {
        user.profile = stringifiedProfile
        needSave = true
      }
      if (needSave) {
        user.save().then(function () {
          logger.debug(`user login: ${user.id}`)
          return done(null, user)
        })
      } else {
        logger.debug(`user login: ${user.id}`)
        return done(null, user)
      }
    }
  }).catch(function (err: any) {
    logger.error('auth callback failed: ' + err)
    return done(err, null)
  })
}))

openIDAuth.post('/auth/openid', urlencodedParser, function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('openid')(req, res, next)
})

// openID auth callback
openIDAuth.get('/auth/openid/callback',
  passport.authenticate('openid', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

export = openIDAuth
