'use strict'

const Op = require('sequelize').Op
const config = require('../../config')
const models = require('../../models')
const logger = require('../../logger')

exports.passportGeneralCallback = function callback (accessToken, refreshToken, profile, done) {
  const stringifiedProfile = JSON.stringify(profile)
  const profileid = profile.id.toString()
  let where = {
    profileid
  }
  if (config.mergeOnEmail) {
    where = {
      [Op.or]: [
        where,
        {
          email: profile.email
        }
      ]
    } 
  }
  models.User.findOrCreate({
    where,
    defaults: {
      profile: stringifiedProfile,
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  }).spread(function (user, created) {
    if (user) {
      let needSave = false
      if (config.mergeOnEmail && user.profileid !== profileid) {
        user.profileid = profileid
        needSave = true
      }
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
  }).catch(function (err) {
    logger.error('auth callback failed: ' + err)
    return done(err, null)
  })
}
