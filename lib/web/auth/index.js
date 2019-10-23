'use strict'

const Router = require('express').Router
const passport = require('passport')

const config = require('../../config')
const logger = require('../../logger')
const models = require('../../models')

const authRouter = module.exports = Router()

// serialize and deserialize
passport.serializeUser(function (user, done) {
  logger.info('serializeUser: ' + user.id)
  return done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  models.User.findOne({
    where: {
      id: id
    }
  }).then(function (user) {
    // Don't die on non-existent user
    if (user == null) {
      return done(null, false, { message: 'Invalid UserID' })
    }

    logger.info('deserializeUser: ' + user.id)
    return done(null, user)
  }).catch(function (err) {
    logger.error(err)
    return done(err, null)
  })
})

if (config.get('isFacebookEnable')) authRouter.use(require('./facebook'))
if (config.get('isTwitterEnable')) authRouter.use(require('./twitter'))
if (config.get('isGitHubEnable')) authRouter.use(require('./github'))
if (config.get('isGitLabEnable')) authRouter.use(require('./gitlab'))
if (config.get('isMattermostEnable')) authRouter.use(require('./mattermost'))
if (config.get('isDropboxEnable')) authRouter.use(require('./dropbox'))
if (config.get('isGoogleEnable')) authRouter.use(require('./google'))
if (config.get('isLDAPEnable')) authRouter.use(require('./ldap'))
if (config.get('isSAMLEnable')) authRouter.use(require('./saml'))
if (config.get('isOAuth2Enable')) authRouter.use(require('./oauth2'))
if (config.get('isEmailEnable')) authRouter.use(require('./email'))
if (config.get('isOpenIDEnable')) authRouter.use(require('./openid'))

// logout
authRouter.get('/logout', function (req, res) {
  if (config.get('debug') && req.isAuthenticated()) {
    logger.debug('user logout: ' + req.user.id)
  }
  req.logout()
  res.redirect(config.get('serverURL') + '/')
})
