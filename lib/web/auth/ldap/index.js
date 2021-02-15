'use strict'

const Router = require('express').Router
const passport = require('passport')
const LDAPStrategy = require('passport-ldapauth')
const config = require('../../../config')
const models = require('../../../models')
const logger = require('../../../logger')
const { urlencodedParser } = require('../../utils')
const errors = require('../../../errors')

const ldapAuth = module.exports = Router()

passport.use(new LDAPStrategy({
  server: {
    url: config.ldap.url || null,
    bindDN: config.ldap.bindDn || null,
    bindCredentials: config.ldap.bindCredentials || null,
    searchBase: config.ldap.searchBase || null,
    searchFilter: config.ldap.searchFilter || null,
    searchAttributes: config.ldap.searchAttributes || null,
    tlsOptions: config.ldap.tlsOptions || null
  }
}, function (user, done) {
  let uuid = user.uidNumber || user.uid || user.sAMAccountName || undefined
  if (config.ldap.useridField && user[config.ldap.useridField]) {
    uuid = user[config.ldap.useridField]
  }

  if (typeof uuid === 'undefined') {
    throw new Error('Could not determine UUID for LDAP user. Check that ' +
    'either uidNumber, uid or sAMAccountName is set in your LDAP directory ' +
    'or use another unique attribute and configure it using the ' +
    '"useridField" option in ldap settings.')
  }

  let username = uuid
  if (config.ldap.usernameField && user[config.ldap.usernameField]) {
    username = user[config.ldap.usernameField]
  }

  const profile = {
    id: 'LDAP-' + uuid,
    username: username,
    displayName: user.displayName,
    emails: user.mail ? Array.isArray(user.mail) ? user.mail : [user.mail] : [],
    avatarUrl: null,
    profileUrl: null,
    provider: 'ldap'
  }
  const stringifiedProfile = JSON.stringify(profile)
  models.User.findOrCreate({
    where: {
      profileid: profile.id.toString()
    },
    defaults: {
      profile: stringifiedProfile
    }
  }).spread(function (user, created) {
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
  }).catch(function (err) {
    logger.error('ldap auth failed: ' + err)
    return done(err, null)
  })
}))

ldapAuth.post('/auth/ldap', urlencodedParser, function (req, res, next) {
  if (!req.body.username || !req.body.password) return errors.errorBadRequest(res)
  passport.authenticate('ldapauth', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/',
    failureFlash: true
  })(req, res, next)
})
