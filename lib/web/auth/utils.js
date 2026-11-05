'use strict'

import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { Op } = require('sequelize')
const models = require('../../models')
const logger = require('../../logger')

export const passportGeneralCallback = (providerName) => function callback (accessToken, refreshToken, profile, done) {
  const stringifiedProfile = JSON.stringify(profile)
  models.User.findOrCreate({
    where: {
      [Op.and]: [
        {
          profileid: profile.id.toString()
        },
        {
          profileProvider: {
            [Op.or]: [
              {
                [Op.eq]: providerName
              },
              {
                [Op.eq]: null
              }
            ]
          }
        }
      ]
    },
    defaults:
      {
        profile: stringifiedProfile,
        profileid: profile.id.toString(),
        profileProvider: providerName,
        accessToken,
        refreshToken
      }
  }).spread(function (user, created) {
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
      if (user.profileProvider === null) {
        user.profileProvider = providerName
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
  }).catch(function (err) {
    logger.error('auth callback failed: ' + err)
    return done(err, null)
  })
}


