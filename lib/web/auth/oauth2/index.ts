'use strict'

import type { Request, Response, NextFunction } from 'express'
import { Router } from 'express'
import passport = require('passport')
import { Strategy, InternalOAuthError } from 'passport-oauth2'
import config = require('../../../config')
import logger = require('../../../logger')
import { passportGeneralCallback } from '../utils'

const oauth2Auth = Router()

class OAuth2CustomStrategy extends Strategy {
  _userProfileURL: string

  constructor (options: any, verify: any) {
    options.customHeaders = options.customHeaders || {}
    super(options, verify)
    this.name = 'oauth2'
    this._userProfileURL = options.userProfileURL
    ;(this as any)._oauth2.useAuthorizationHeaderforGET(true)
  }

  userProfile (accessToken: string, done: Function): void {
    ;(this as any)._oauth2.get(this._userProfileURL, accessToken, function (err: any, body: string, res: any) {
      let json: any, profile: any

      if (err) {
        return done(new InternalOAuthError('Failed to fetch user profile', err))
      }

      try {
        json = JSON.parse(body)
      } catch (ex) {
        return done(new Error('Failed to parse user profile'))
      }

      checkAuthorization(json, done)
      try {
        profile = parseProfile(json)
      } catch (ex) {
        return done('Failed to identify user profile information', null)
      }
      profile.provider = 'oauth2'

      done(null, profile)
    })
  }
}

function extractProfileAttribute (data: any, path: string): any {
  // can handle stuff like `attrs[0].name`
  const segments = path.split('.')
  for (const segment of segments) {
    const m = segment.match(/([\d\w]+)\[(.*)\]/)
    data = m ? data[m[1]][m[2]] : data[segment]
  }
  return data
}

function parseProfile (data: any): any {
  // only try to parse the id if a claim is configured
  const id = config.oauth2.userProfileIdAttr ? extractProfileAttribute(data, config.oauth2.userProfileIdAttr) : undefined
  const username = extractProfileAttribute(data, config.oauth2.userProfileUsernameAttr)
  const displayName = extractProfileAttribute(data, config.oauth2.userProfileDisplayNameAttr)
  const email = extractProfileAttribute(data, config.oauth2.userProfileEmailAttr)

  if (id === undefined && username === undefined) {
    logger.error('oauth2 auth failed: id and username are undefined')
    throw new Error('User ID or Username required')
  }

  return {
    id: id || username,
    username,
    displayName,
    emails: email ? [email] : []
  }
}

function checkAuthorization (data: any, done: Function): void {
  // a role the user must have is set in the config
  if (config.oauth2.accessRole) {
    // check if we know which claim contains the list of groups a user is in
    if (!config.oauth2.rolesClaim) {
      // log error, but accept all logins
      logger.error('oauth2: "accessRole" is configured, but "rolesClaim" is missing from the config. Can\'t check group membership!')
    } else {
      // parse and check role data
      let roles: any[] = []
      try {
        roles = extractProfileAttribute(data, config.oauth2.rolesClaim)
      } catch (err) {
        logger.warn(`oauth2: failed to extract rolesClaim '${config.oauth2.rolesClaim}' from user profile.`)
        return done('Permission denied', null)
      }
      if (!roles) {
        logger.error('oauth2: "accessRole" is configured, but user profile doesn\'t contain roles attribute. Permission denied')
        return done('Permission denied', null)
      }
      if (!roles.includes(config.oauth2.accessRole)) {
        const username = extractProfileAttribute(data, config.oauth2.userProfileUsernameAttr)
        logger.debug(`oauth2: user "${username}" doesn't have the required role. Permission denied`)
        return done('Permission denied', null)
      }
    }
  }
}

OAuth2CustomStrategy.prototype.userProfile = function (accessToken: string, done: Function): void {
  ;(this as any)._oauth2.get(this._userProfileURL, accessToken, function (err: any, body: string, res: any) {
    let json: any, profile: any

    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err))
    }

    try {
      json = JSON.parse(body)
    } catch (ex) {
      return done(new Error('Failed to parse user profile'))
    }

    checkAuthorization(json, done)
    try {
      profile = parseProfile(json)
    } catch (ex) {
      return done('Failed to identify user profile information', null)
    }
    profile.provider = 'oauth2'

    done(null, profile)
  })
}

passport.use(new OAuth2CustomStrategy({
  authorizationURL: config.oauth2.authorizationURL,
  tokenURL: config.oauth2.tokenURL,
  clientID: config.oauth2.clientID,
  clientSecret: config.oauth2.clientSecret,
  callbackURL: config.serverURL + '/auth/oauth2/callback',
  userProfileURL: config.oauth2.userProfileURL,
  scope: config.oauth2.scope,
  pkce: config.oauth2.pkce,
  state: true
}, passportGeneralCallback))

oauth2Auth.get('/auth/oauth2', function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate('oauth2')(req, res, next)
})

// github auth callback
oauth2Auth.get('/auth/oauth2/callback',
  passport.authenticate('oauth2', {
    successReturnToOrRedirect: config.serverURL + '/',
    failureRedirect: config.serverURL + '/'
  })
)

export = oauth2Auth
