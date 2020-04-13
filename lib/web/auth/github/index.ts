import { Router } from 'express'
import passport from 'passport'
import { Strategy as GithubStrategy } from 'passport-github'
import { config } from '../../../config'
import { response } from '../../../response'
import { AuthMiddleware } from '../interface'
import { passportGeneralCallback } from '../utils'

export const GithubMiddleware: AuthMiddleware = {
  getMiddleware (): Router {
    const githubAuth = Router()

    passport.use(new GithubStrategy({
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.serverURL + '/auth/github/callback'
    }, passportGeneralCallback))

    githubAuth.get('/auth/github', function (req, res, next) {
      passport.authenticate('github')(req, res, next)
    })

    // github auth callback
    githubAuth.get('/auth/github/callback',
      passport.authenticate('github', {
        successReturnToOrRedirect: config.serverURL + '/',
        failureRedirect: config.serverURL + '/'
      })
    )

    // github callback actions
    githubAuth.get('/auth/github/callback/:noteId/:action', response.githubActions)

    return githubAuth
  }
}
