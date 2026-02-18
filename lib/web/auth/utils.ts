'use strict'

import models = require('../../models')
import logger = require('../../logger')

export function passportGeneralCallback (accessToken: string, refreshToken: string, profile: any, done: (err: Error | null, user?: any) => void): void {
  const stringifiedProfile = JSON.stringify(profile)
  models.User.findOrCreate({
    where: {
      profileid: profile.id.toString()
    },
    defaults: {
      profile: stringifiedProfile,
      accessToken,
      refreshToken
    }
  }).spread(function (user: any, created: boolean) {
    if (user) {
      let needSave = false
      if (user.profile !== stringifiedProfile) {
        user.profile = stringifiedProfile
        needSave = true
      }
      if (user.accessToken !== accessToken) {
        user.accessToken = accessToken
        needSave = true
      }
      if (user.refreshToken !== refreshToken) {
        user.refreshToken = refreshToken
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
  }).catch(function (err: Error) {
    logger.error('auth callback failed: ' + err)
    return done(err, null)
  })
}
