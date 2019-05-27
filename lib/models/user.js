'use strict'
// external modules
const Sequelize = require('sequelize')
const crypto = require('crypto')
if (!crypto.scrypt) {
  // polyfill for node.js 8.0, see https://github.com/chrisveness/scrypt-kdf#openssl-implementation
  const scryptAsync = require('scrypt-async')
  crypto.scrypt = function (password, salt, keylen, options, callback) {
    const opt = Object.assign({}, options, { dkLen: keylen })
    scryptAsync(password, salt, opt, (derivedKey) => callback(null, Buffer.from(derivedKey)))
  }
}
const scrypt = require('scrypt-kdf')

// core
const logger = require('../logger')
const { generateAvatarURL } = require('../letter-avatars')

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
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
      type: DataTypes.TEXT
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
  }, {
    instanceMethods: {
      verifyPassword: function (attempt) {
        return scrypt.verify(Buffer.from(this.password, 'hex'), attempt)
      }
    },
    classMethods: {
      associate: function (models) {
        User.hasMany(models.Note, {
          foreignKey: 'ownerId',
          constraints: false
        })
        User.hasMany(models.Note, {
          foreignKey: 'lastchangeuserId',
          constraints: false
        })
      },
      getProfile: function (user) {
        if (!user) {
          return null
        }
        return user.profile ? User.parseProfile(user.profile) : (user.email ? User.parseProfileByEmail(user.email) : null)
      },
      parseProfile: function (profile) {
        try {
          profile = JSON.parse(profile)
        } catch (err) {
          logger.error(err)
          profile = null
        }
        if (profile) {
          profile = {
            name: profile.displayName || profile.username,
            photo: User.parsePhotoByProfile(profile),
            biggerphoto: User.parsePhotoByProfile(profile, true)
          }
        }
        return profile
      },
      parsePhotoByProfile: function (profile, bigger) {
        var photo = null
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
          default:
            photo = generateAvatarURL(profile.username)
            break
        }
        return photo
      },
      parseProfileByEmail: function (email) {
        return {
          name: email.substring(0, email.lastIndexOf('@')),
          photo: generateAvatarURL('', email, false),
          biggerphoto: generateAvatarURL('', email, true)
        }
      }
    }
  })

  function updatePasswordHashHook (user, options, done) {
    // suggested way to hash passwords to be able to do this asynchronously:
    // @see https://github.com/sequelize/sequelize/issues/1821#issuecomment-44265819
    if (!user.changed('password')) { return done() }

    scrypt.kdf(user.getDataValue('password'), { logN: 15 }).then(keyBuf => {
      user.setDataValue('password', keyBuf.toString('hex'))
      done()
    })
  }

  User.beforeCreate(updatePasswordHashHook)
  User.beforeUpdate(updatePasswordHashHook)

  return User
}
