'use strict'

const Router = require('express').Router
const passport = require('passport')
const LDAPStrategy = require('passport-ldapauth')
const config = require('../../../config')
const models = require('../../../models')
const logger = require('../../../logger')
const { urlencodedParser } = require('../../utils')
const errors = require('../../../errors')

let ldapAuth = module.exports = Router()

passport.use(new LDAPStrategy({
  server: {
    url: config.get('ldap').url || null,
    bindDN: config.get('ldap').bindDn || null,
    bindCredentials: config.get('ldap').bindCredentials || null,
    searchBase: config.get('ldap').searchBase || null,
    searchFilter: config.get('ldap').searchFilter || null,
    searchAttributes: config.get('ldap').searchAttributes || null,
    tlsOptions: config.get('ldap').tlsOptions || null
  }
}, function (user, done) {
  var uuid = user.uidNumber || user.uid || user.sAMAccountName || undefined
  if (config.get('ldap').useridField && user[config.get('ldap').useridField]) {
    uuid = user[config.get('ldap').useridField]
  }

  if (typeof uuid === 'undefined') {
    throw new Error('Could not determine UUID for LDAP user. Check that ' +
    'either uidNumber, uid or sAMAccountName is set in your LDAP directory ' +
    'or use another unique attribute and configure it using the ' +
    '"useridField" option in ldap settings.')
  }

  var username = uuid
  if (config.get('ldap').usernameField && user[config.get('ldap').usernameField]) {
    username = user[config.get('ldap').usernameField]
  }

  var profile = {
    id: 'LDAP-' + uuid,
    username: username,
    displayName: user.displayName,
    emails: user.mail ? Array.isArray(user.mail) ? user.mail : [user.mail] : [],
    avatarUrl: null,
    profileUrl: null,
    provider: 'ldap'
  }
  var stringifiedProfile = JSON.stringify(profile)
  models.User.findOrCreate({
    where: {
      profileid: profile.id.toString()
    },
    defaults: {
      profile: stringifiedProfile
    }
  }).spread(function (user, created) {
    if (user) {
      var needSave = false
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
    successReturnToOrRedirect: config.get('serverURL') + '/',
    failureRedirect: config.get('serverURL') + '/',
    failureFlash: true
  })(req, res, next)
})
