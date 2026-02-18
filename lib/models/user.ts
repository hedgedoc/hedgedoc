'use strict'
// external modules
const Sequelize = require('sequelize')
import scrypt = require('scrypt-kdf')
const filterXSS: any = require('xss')

// core
import logger = require('../logger')
import { generateAvatarURL } from '../letter-avatars'

module.exports = function (sequelize: any, DataTypes: any): any {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    profileid: {
      type: DataTypes.STRING,
      unique: true
    },
    profile: {
      type: DataTypes.TEXT
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
      type: Sequelize.TEXT,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.TEXT
    }
  })

  User.prototype.verifyPassword = function (attempt: string): Promise<boolean> {
    return scrypt.verify(Buffer.from(this.password, 'hex'), attempt)
  }

  User.associate = function (models: any): void {
    User.hasMany(models.Note, {
      foreignKey: 'ownerId',
      constraints: false
    })
    User.hasMany(models.Note, {
      foreignKey: 'lastchangeuserId',
      constraints: false
    })
  }
  User.getProfile = function (user: any): any {
    if (!user) {
      return null
    }
    return user.profile ? User.parseProfile(user.profile) : (user.email ? User.parseProfileByEmail(user.email) : null)
  }
  User.parseProfile = function (profile: any): any {
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
  User.parsePhotoByProfile = function (profile: any, bigger?: boolean): string | null {
    let photo: string | null = null
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
        if (bigger) photo = photo!.replace(/(\?sz=)\d*$/i, '$1400')
        else photo = photo!.replace(/(\?sz=)\d*$/i, '$196')
        break
      case 'ldap':
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      case 'saml':
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      default:
        if (profile.emails && profile.emails.length > 0) {
          photo = generateAvatarURL(profile.username, profile.emails[0])
          break
        }
        photo = generateAvatarURL(profile.username)
        break
    }
    return filterXSS(photo)
  }
  User.parseProfileByEmail = function (email: string): { name: string; photo: string; biggerphoto: string } {
    return {
      name: email.substring(0, email.lastIndexOf('@')),
      photo: generateAvatarURL('', email, false),
      biggerphoto: generateAvatarURL('', email, true)
    }
  }

  function updatePasswordHashHook (user: any, options: any): Promise<void> {
    // suggested way to hash passwords to be able to do this asynchronously:
    // @see https://github.com/sequelize/sequelize/issues/1821#issuecomment-44265819

    if (!user.changed('password')) {
      return Promise.resolve()
    }

    return scrypt.kdf(user.getDataValue('password'), { logN: 15 } as any).then((keyBuf: Buffer) => {
      user.setDataValue('password', keyBuf.toString('hex'))
    })
  }

  User.beforeCreate(updatePasswordHashHook)
  User.beforeUpdate(updatePasswordHashHook)

  return User
}
