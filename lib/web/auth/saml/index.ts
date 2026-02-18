'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
const SamlStrategy = require('@node-saml/passport-saml').Strategy
import config = require('../../../config')
import models = require('../../../models')
import logger = require('../../../logger')
import { urlencodedParser } from '../../utils'
import * as fs from 'fs'
const intersection = function (array1: string[], array2: string[]): string[] { return array1.filter((n) => array2.includes(n)) }

const samlAuth = Router()

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
            } catch (e: any) {
              logger.error(`SAML client certificate: ${e.message}`)
            }
          }()),
      idpCert: (function () {
        try {
          return fs.readFileSync(config.saml.idpCert, 'utf-8')
        } catch (e: any) {
          logger.error(`SAML idp certificate: ${e.message}`)
          process.exit(1)
        }
      }()),
      identifierFormat: config.saml.identifierFormat,
      disableRequestedAuthnContext: config.saml.disableRequestedAuthnContext,
      wantAssertionsSigned: config.saml.wantAssertionsSigned,
      wantAuthnResponseSigned: config.saml.wantAuthnResponseSigned
    },
    // sign-in
    function (user: any, done: Function) {
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
      if (!uuid) {
        logger.error('saml auth failed: id not found')
        return done('Permission denied', null)
      }
      const profile = {
        provider: 'saml',
        id: 'SAML-' + uuid,
        username: user[config.saml.attribute.username] || user.nameID,
        emails: user[config.saml.attribute.email] ? [user[config.saml.attribute.email]] : config.saml.identifierFormat === 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress' ? [user.nameID] : []
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
        logger.error('saml auth failed: ' + err.message)
        return done(err, null)
      })
    },
    // logout
    function (profile: any, done: Function) {
      return done(null, profile)
    }
  )
)

samlAuth.get('/auth/saml',
  passport.authenticate('saml', {
    failureRedirect: config.serverURL + '/',
    failureFlash: true
  }),
  function (req: Request, res: Response) {
    res.redirect('/')
  }
)

samlAuth.use('/auth/saml/callback', urlencodedParser,
  function (req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).end()
    }
    return next()
  },
  passport.authenticate('saml', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  }),
  function (req: Request, res: Response) {
    res.redirect('/')
  }
)

samlAuth.get('/auth/saml/metadata', function (req: Request, res: Response) {
  res.type('application/xml')
  res.send((passport as any)._strategy('saml').generateServiceProviderMetadata())
})

export = samlAuth
