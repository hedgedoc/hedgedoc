import { Router } from 'express'
import passport from 'passport'
import * as OpenID from '@passport-next/passport-openid'
import { config } from '../../../config'
import { User } from '../../../models'
import { logger } from '../../../logger'
import { urlencodedParser } from '../../utils'
import { AuthMiddleware } from '../interface'

const openIDAuth = Router()
export const OPenIDMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    passport.use(new OpenID.Strategy({
      returnURL: config.serverURL + '/auth/openid/callback',
      realm: config.serverURL,
      profile: true
    }, function (openid, profile, done) {
      const stringifiedProfile = JSON.stringify(profile)
      User.findOrCreate({
        where: {
          profileid: openid
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
        logger.error('auth callback failed: ' + err)
        return done(err, null)
      })
    }))
    openIDAuth.post('/auth/openid', urlencodedParser, function (req, res, next) {
      passport.authenticate('openid')(req, res, next)
    })
    openIDAuth.get('/auth/openid/callback',
      passport.authenticate('openid', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )
    return openIDAuth
  }
}
