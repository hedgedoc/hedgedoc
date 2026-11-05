'use strict'

import Scrypt from 'scrypt-kdf'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// external modules
const Sequelize = require('sequelize')
const filterXSS = require('xss')

// core
const logger = require('../logger')
const { verifyPassword } = require('../web/auth/password')
const { generateAvatarURL } = require('../letter-avatars')

function safePhotoURL (photo) {
  try {
    const relative = typeof photo === 'string' && /^\/(?![/\\])/.test(photo)
    const url = relative ? new URL(photo, 'https://localhost') : new URL(photo)
    const imageData = url.protocol === 'data:' && /^data:image\/[a-z0-9.+-]+(?:;[a-z0-9!#$&^_.+%=-]+)*,/i.test(url.href)
    if (!['http:', 'https:'].includes(url.protocol) && !imageData) return null
    const value = relative ? url.pathname + url.search + url.hash : url.href
    return value.replace(/[()'"\\]/g, char => '%' + char.charCodeAt(0).toString(16).toUpperCase())
  } catch (err) {
    return null
  }
}

function UserModel (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    profileid: {
      type: DataTypes.STRING,
      unique: 'user_profile_id_profile_provider_index'
    },
    profile: {
      type: DataTypes.TEXT
    },
    profileProvider: {
      type: DataTypes.ENUM(
        'dropbox',
        'email',
        'facebook',
        'github',
        'gitlab',
        'google',
        'ldap',
        'mattermost',
        'oauth2',
        'openid',
        'saml',
        'twitter'
      ),
      unique: 'user_profile_id_profile_provider_index'
    },
    history: {
      type: DataTypes.TEXT('long')
    },
    accessToken: {
      type: DataTypes.TEXT
    },
    refreshToken: {
      type: DataTypes.TEXT
    },
    deleteToken: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.TEXT
    }
  })

  User.prototype.verifyPassword = async function (attempt) {
    return verifyPassword(attempt, this.password)
  }

  User.associate = function (models) {
    User.hasMany(models.Note, {
      foreignKey: 'ownerId',
      constraints: false
    })
    User.hasMany(models.Note, {
      foreignKey: 'lastchangeuserId',
      constraints: false
    })
  }
  User.getProfile = function (user) {
    if (!user) {
      return null
    }
    return user.profile ? User.parseProfile(user.profile) : (user.email ? User.parseProfileByEmail(user.email) : null)
  }
  User.parseProfile = function (profile) {
    try {
      profile = JSON.parse(profile)
    } catch (err) {
      logger.error(err)
      profile = null
    }
    if (profile) {
      profile = {
        name: filterXSS(profile.displayName || profile.username),
        photo: User.parsePhotoByProfile(profile),
        biggerphoto: User.parsePhotoByProfile(profile, true)
      }
    }
    return profile
  }
  User.parsePhotoByProfile = function (profile, bigger) {
    let photo = null
    switch (profile.provider) {
      case 'facebook':
        photo = 'https://graph.facebook.com/' + profile.id + '/picture'
        if (bigger) photo += '?width=400'
        else photo += '?width=96'
        break
      case 'twitter':
        photo = 'https://twitter.com/' + profile.username + '/profile_image'
        if (bigger) photo += '?size=original'
        else photo += '?size=bigger'
        break
      case 'github':
        photo = 'https://avatars.githubusercontent.com/u/' + profile.id
        if (bigger) photo += '?s=400'
        else photo += '?s=96'
        break
      case 'gitlab':
        photo = profile.avatarUrl
        if (photo) {
          if (bigger) photo = photo.replace(/(\?s=)\d*$/i, '$1400')
          else photo = photo.replace(/(\?s=)\d*$/i, '$196')
        } else {
          photo = generateAvatarURL(profile.username)
        }
        break
      case 'mattermost':
        photo = profile.avatarUrl
        if (photo) {
          if (bigger) photo = photo.replace(/(\?s=)\d*$/i, '$1400')
          else photo = photo.replace(/(\?s=)\d*$/i, '$196')
        } else {
          photo = generateAvatarURL(profile.username)
        }
        break
      case 'dropbox':
        photo = generateAvatarURL('', profile.emails[0].value, bigger)
        break
      case 'google':
        photo = profile.photos[0].value
        if (bigger) photo = photo.replace(/(\?sz=)\d*$/i, '$1400')
        else photo = photo.replace(/(\?sz=)\d*$/i, '$196')
        break
      case 'ldap':
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      case 'saml':
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      case 'oauth2':
        photo = profile.photo || generateAvatarURL(profile.username, profile.emails && profile.emails[0], bigger)
        break
      default:
        if (profile.emails && profile.emails.length > 0) {
          photo = generateAvatarURL(profile.username, profile.emails[0])
          break
        }
        photo = generateAvatarURL(profile.username)
        break
    }
    return safePhotoURL(photo)
  }
  User.parseProfileByEmail = function (email) {
    const sanitizedEmail = email.replaceAll('"', '').replaceAll("'", '').replaceAll('<', '').replaceAll('>', '')
    return {
      name: sanitizedEmail.split('@')[0],
      photo: safePhotoURL(generateAvatarURL('', sanitizedEmail, false)),
      biggerphoto: safePhotoURL(generateAvatarURL('', sanitizedEmail, true))
    }
  }

  async function updatePasswordHashHook (user, options) {
    // suggested way to hash passwords to be able to do this asynchronously:
    // @see https://github.com/sequelize/sequelize/issues/1821#issuecomment-44265819

    if (!user.changed('password')) {
      return Promise.resolve()
    }

    return Scrypt.kdf(user.getDataValue('password'), { logN: 15 }).then(keyBuf => {
      user.setDataValue('password', Buffer.from(keyBuf).toString('hex'))
    })
  }

  User.beforeCreate(updatePasswordHashHook)
  User.beforeUpdate(updatePasswordHashHook)

  return User
}

export default UserModel
