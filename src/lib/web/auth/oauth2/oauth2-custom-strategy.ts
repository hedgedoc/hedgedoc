import { InternalOAuthError, Strategy as OAuth2Strategy } from 'passport-oauth2'
import { config } from '../../../config'
import { PassportProfile, ProviderEnum } from '../utils'
import { logger } from '../../../logger'

function extractProfileAttribute (data, path: string): string {
  // can handle stuff like `attrs[0].name`
  const pathArray = path.split('.')
  for (const segment of pathArray) {
    const regex = /([\d\w]+)\[(.*)\]/
    const m = regex.exec(segment)
    data = m ? data[m[1]][m[2]] : data[segment]
  }
  return data
}

function parseProfile (data): Partial<PassportProfile> {
  const username = extractProfileAttribute(data, config.oauth2.userProfileUsernameAttr)
  let displayName: string | undefined
  try {
    // This may fail if the config.oauth2.userProfileDisplayNameAttr is undefined,
    // or it is foo.bar and data["foo"] is undefined.
    displayName = extractProfileAttribute(data, config.oauth2.userProfileDisplayNameAttr)
  } catch (e) {
    displayName = undefined
    logger.debug('\'id_token[%s]\' is undefined. Setting \'displayName\' to \'undefined\'.\n%s', config.oauth2.userProfileDisplayNameAttr, e.message)
  }

  const emails: string[] = []
  try {
    const email = extractProfileAttribute(data, config.oauth2.userProfileEmailAttr)
    if (email !== undefined) {
      emails.push(email)
    } else {
      logger.debug('\'id_token[%s]\' is undefined. Setting \'emails\' to [].', config.oauth2.userProfileEmailAttr)
    }
  } catch (e) {
    logger.debug('\'id_token[%s]\' is undefined. Setting \'emails\' to [].\n%s', config.oauth2.userProfileEmailAttr, e.message)
  }

  return {
    id: username,
    username: username,
    displayName: displayName,
    emails: emails
  }
}

class OAuth2CustomStrategy extends OAuth2Strategy {
  private readonly _userProfileURL: string;

  constructor (options, verify) {
    options.customHeaders = options.customHeaders || {}
    super(options, verify)
    this.name = 'oauth2'
    this._userProfileURL = options.userProfileURL
    this._oauth2.useAuthorizationHeaderforGET(true)
  }

  userProfile (accessToken, done): void {
    this._oauth2.get(this._userProfileURL, accessToken, function (err, body, _) {
      let json

      if (err) {
        return done(new InternalOAuthError('Failed to fetch user profile', err))
      }

      try {
        if (body !== undefined) {
          json = JSON.parse(body.toString())
        }
      } catch (ex) {
        return done(new Error('Failed to parse user profile'))
      }

      const profile = parseProfile(json)
      profile.provider = ProviderEnum.oauth2

      done(null, profile)
    })
  }
}

export { OAuth2CustomStrategy }
