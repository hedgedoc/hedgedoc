import { Request, Response, Router } from 'express'
import passport from 'passport'
import { config } from '../../config'
import { logger } from '../../logger'
import { User } from '../../models'
import { FacebookMiddleware } from './facebook'
import { TwitterMiddleware } from './twitter'
import { GithubMiddleware } from './github'
import { GitlabMiddleware } from './gitlab'
import { DropboxMiddleware } from './dropbox'
import { GoogleMiddleware } from './google'
import { LdapMiddleware } from './ldap'
import { SamlMiddleware } from './saml'
import oauth2 from './oauth2'
import { EmailMiddleware } from './email'
import openid from './openid'

const AuthRouter = Router()

// serialize and deserialize
passport.serializeUser(function (user: User, done) {
  logger.info('serializeUser: ' + user.id)
  return done(null, user.id)
})

passport.deserializeUser(function (id: string, done) {
  User.findOne({
    where: {
      id: id
    }
  }).then(function (user) {
    // Don't die on non-existent user
    if (user == null) {
      // The extra object with message doesn't exits in @types/passport
      return done(null, false) // , { message: 'Invalid UserID' })
    }

    logger.info('deserializeUser: ' + user.id)
    return done(null, user)
  }).catch(function (err) {
    logger.error(err)
    return done(err, null)
  })
})

if (config.isFacebookEnable) AuthRouter.use(FacebookMiddleware.getMiddleware())
if (config.isTwitterEnable) AuthRouter.use(TwitterMiddleware.getMiddleware())
if (config.isGitHubEnable) AuthRouter.use(GithubMiddleware.getMiddleware())
if (config.isGitLabEnable) AuthRouter.use(GitlabMiddleware.getMiddleware())
if (config.isDropboxEnable) AuthRouter.use(DropboxMiddleware.getMiddleware())
if (config.isGoogleEnable) AuthRouter.use(GoogleMiddleware.getMiddleware())
if (config.isLDAPEnable) AuthRouter.use(LdapMiddleware.getMiddleware())
if (config.isSAMLEnable) AuthRouter.use(SamlMiddleware.getMiddleware())
if (config.isOAuth2Enable) AuthRouter.use(oauth2)
if (config.isEmailEnable) AuthRouter.use(EmailMiddleware.getMiddleware())
if (config.isOpenIDEnable) AuthRouter.use(openid)

// logout
AuthRouter.get('/logout', function (req: Request, res: Response) {
  if (config.debug && req.isAuthenticated()) {
    if (req.user !== undefined) {
      logger.debug('user logout: ' + req.user.id)
    }
  }
  req.logout()
  res.redirect(config.serverURL + '/')
})

export { AuthRouter }
