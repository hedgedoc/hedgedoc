'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const LDAPStrategy = require('passport-ldapauth')
import config = require('../../../config')
import models = require('../../../models')
import logger = require('../../../logger')
import { urlencodedParser } from '../../utils'
import * as errors from '../../../errors'
import { cloneDeep } from 'lodash'

const ldapAuth = Router()

// ldapauth-fork mutates the config object, so we need to make a clone of our deep-frozen config
const mutableLdapConfig = cloneDeep(config.ldap)

passport.use(new LDAPStrategy({
  server: {
    url: mutableLdapConfig.url || null,
    bindDN: mutableLdapConfig.bindDn || null,
    bindCredentials: mutableLdapConfig.bindCredentials || null,
    searchBase: mutableLdapConfig.searchBase || null,
    searchFilter: mutableLdapConfig.searchFilter || null,
    searchAttributes: mutableLdapConfig.searchAttributes || null,
    tlsOptions: mutableLdapConfig.tlsOptions || null
  }
}, function (user: any, done: Function) {
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
    username,
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
    logger.error('ldap auth failed: ' + err)
    return done(err, null)
  })
}))

ldapAuth.post('/auth/ldap', urlencodedParser, function (req: Request, res: Response, next: NextFunction) {
  if (!req.body.username || !req.body.password) return errors.errorBadRequest(res)
  passport.authenticate('ldapauth', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/',
    failureFlash: true
  })(req, res, next)
})

export = ldapAuth
