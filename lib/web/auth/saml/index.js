'use strict'

const Router = require('express').Router
const passport = require('passport')
const SamlStrategy = require('@node-saml/passport-saml').Strategy
const config = require('../../../config')
const models = require('../../../models')
const logger = require('../../../logger')
const { urlencodedParser } = require('../../utils')
const fs = require('fs')
const intersection = function (array1, array2) { return array1.filter((n) => array2.includes(n)) }

const samlAuth = module.exports = Router()

passport.use(
  new SamlStrategy(
    {
      callbackUrl: config.serverURL + '/auth/saml/callback',
      entryPoint: config.saml.idpSsoUrl,
      issuer: config.saml.issuer || config.serverURL,
      privateKey: config.saml.clientCert === undefined
        ? undefined
        : (function () {
            try {
              return fs.readFileSync(config.saml.clientCert, 'utf-8')
            } catch (e) {
              logger.error(`SAML client certificate: ${e.message}`)
            }
          }()),
      idpCert: (function () {
        try {
          return fs.readFileSync(config.saml.idpCert, 'utf-8')
        } catch (e) {
          logger.error(`SAML idp certificate: ${e.message}`)
          process.exit(1)
        }
      }()),
      identifierFormat: config.saml.identifierFormat,
      disableRequestedAuthnContext: config.saml.disableRequestedAuthnContext
    },
    // sign-in
    function (user, done) {
      // check authorization if needed
      if (config.saml.externalGroups && config.saml.groupAttribute) {
        const externalGroups = intersection(config.saml.externalGroups, user[config.saml.groupAttribute])
        if (externalGroups.length > 0) {
          logger.error('saml permission denied: ' + externalGroups.join(', '))
          return done('Permission denied', null)
        }
      }
      if (config.saml.requiredGroups && config.saml.groupAttribute) {
        if (intersection(config.saml.requiredGroups, user[config.saml.groupAttribute]).length === 0) {
          logger.error('saml permission denied')
          return done('Permission denied', null)
        }
      }
      // user creation
      const uuid = user[config.saml.attribute.id] || user.nameID
      const profile = {
        provider: 'saml',
        id: 'SAML-' + uuid,
        username: user[config.saml.attribute.username] || user.nameID,
        emails: user[config.saml.attribute.email] ? [user[config.saml.attribute.email]] : []
      }
      if (profile.emails.length === 0 && config.saml.identifierFormat === 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress') {
        profile.emails.push(user.nameID)
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
        logger.error('saml auth failed: ' + err.message)
        return done(err, null)
      })
    },
    // logout
    function (profile, done) {
      return done(null, profile)
    }
  )
)

samlAuth.get('/auth/saml',
  passport.authenticate('saml', {
    failureRedirect: config.serverURL + '/',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/')
  }
)

samlAuth.use('/auth/saml/callback', urlencodedParser,
  function (req, res, next) {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).end()
    }
    return next()
  },
  passport.authenticate('saml', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  }),
  function (req, res) {
    res.redirect('/')
  }
)

samlAuth.get('/auth/saml/metadata', function (req, res) {
  res.type('application/xml')
  res.send(passport._strategy('saml').generateServiceProviderMetadata())
})
