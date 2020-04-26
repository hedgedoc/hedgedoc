import { NextFunction, Request, Response, Router } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import validator from 'validator'
import { config } from '../../../config'
import { errors } from '../../../errors'
import { logger } from '../../../logger'
import { User } from '../../../models'
import { urlencodedParser } from '../../utils'
import { AuthMiddleware } from '../interface'

const emailAuth = Router()

export const EmailMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    passport.use(new LocalStrategy({
      usernameField: 'email'
    }, function (email: string, password: string, done) {
      if (!validator.isEmail(email)) return done(null, false)
      User.findOne({
        where: {
          email: email
        }
      }).then(function (user: User) {
        if (!user) return done(null, false)
        user.verifyPassword(password).then(verified => {
          if (verified) {
            return done(null, user)
          } else {
            logger.warn('invalid password given for %s', user.email)
            return done(null, false)
          }
        })
      }).catch(function (err: Error) {
        logger.error(err)
        return done(err)
      })
    }))

    if (config.allowEmailRegister) {
      emailAuth.post('/register', urlencodedParser, function (req: Request, res: Response, _: NextFunction) {
        if (!req.body.email || !req.body.password) {
          errors.errorBadRequest(res)
          return
        }
        if (!validator.isEmail(req.body.email)) {
          errors.errorBadRequest(res)
          return
        }
        User.findOrCreate({
          where: {
            email: req.body.email
          },
          defaults: {
            password: req.body.password
          }
        }).then(function ([user, created]: [User, boolean]) {
          if (user) {
            if (created) {
              logger.debug('user registered: ' + user.id)
              req.flash('info', "You've successfully registered, please signin.")
              return res.redirect(config.serverURL + '/')
            } else {
              logger.debug('user found: ' + user.id)
              req.flash('error', 'This email has been used, please try another one.')
              return res.redirect(config.serverURL + '/')
            }
          }
          req.flash('error', 'Failed to register your account, please try again.')
          return res.redirect(config.serverURL + '/')
        }).catch(function (err) {
          logger.error('auth callback failed: ' + err)
          errors.errorInternalError(res)
        })
      })
    }

    emailAuth.post('/login', urlencodedParser, function (req: Request, res: Response, next: NextFunction) {
      if (!req.body.email || !req.body.password) {
        errors.errorBadRequest(res)
        return
      }
      if (!validator.isEmail(req.body.email)) {
        errors.errorBadRequest(res)
        return
      }
      passport.authenticate('local', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/',
        failureFlash: 'Invalid email or password.'
      })(req, res, next)
    })
    return emailAuth
  }
}
