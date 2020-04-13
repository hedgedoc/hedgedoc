import { Router } from 'express'
import passport from 'passport'
import { Strategy as SamlStrategy } from 'passport-saml'
import fs from 'fs'

import { config } from '../../../config'
import { User } from '../../../models'
import { logger } from '../../../logger'
import { urlencodedParser } from '../../utils'
import { AuthMiddleware } from '../interface'

function intersection<T> (array1: T[], array2: T[]): T[] {
  return array1.filter((n) => array2.includes(n))
}

export const SamlMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    const SamlAuth = Router()

    const samlStrategy = new SamlStrategy({
      callbackUrl: config.serverURL + '/auth/saml/callback',
      entryPoint: config.saml.idpSsoUrl,
      issuer: config.saml.issuer || config.serverURL,
      cert: fs.readFileSync(config.saml.idpCert, 'utf-8'),
      identifierFormat: config.saml.identifierFormat,
      disableRequestedAuthnContext: config.saml.disableRequestedAuthnContext
    }, function (user, done) {
      // check authorization if needed
      if (config.saml.externalGroups && config.saml.groupAttribute) {
        const externalGroups: string[] = intersection(config.saml.externalGroups, user[config.saml.groupAttribute])
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
      User.findOrCreate({
        where: {
          profileid: profile.id.toString()
        },
        defaults: {
          profile: stringifiedProfile
        }
      }).then(function ([user, _]) {
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
        logger.error('saml auth failed: ' + err)
        return done(err, null)
      })
    })

    passport.use(samlStrategy)

    SamlAuth.get('/auth/saml',
      passport.authenticate('saml', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )

    SamlAuth.post('/auth/saml/callback', urlencodedParser,
      passport.authenticate('saml', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )

    SamlAuth.get('/auth/saml/metadata', function (req, res) {
      res.type('application/xml')
      res.send(samlStrategy.generateServiceProviderMetadata(null))
    })

    return SamlAuth
  }
}
