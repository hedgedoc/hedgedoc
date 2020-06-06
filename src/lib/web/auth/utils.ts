import { Profile } from 'passport'
import { logger } from '../../logger'
import { User } from '../../models'

export function passportGeneralCallback (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (err?: Error | null, user?: User) => void
): void {
  const stringifiedProfile = JSON.stringify(profile)
  User.findOrCreate({
    where: {
      profileid: profile.id.toString()
    },
    defaults: {
      profile: stringifiedProfile,
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  }).then(function ([user, _]) {
    if (user) {
      let needSave = false
      if (user.profile !== stringifiedProfile) {
        user.profile = stringifiedProfile
        needSave = true
      }
      if (user.accessToken !== accessToken) {
        user.accessToken = accessToken
        needSave = true
      }
      if (user.refreshToken !== refreshToken) {
        user.refreshToken = refreshToken
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
    return done(err, undefined)
  })
}

export enum ProviderEnum {
  facebook = 'facebook',
  twitter = 'twitter',
  github = 'github',
  gitlab = 'gitlab',
  dropbox = 'dropbox',
  google = 'google',
  ldap = 'ldap',
  oauth2 = 'oauth2',
  saml = 'saml',
}

export type PassportProfile = {
  id: string;
  username: string;
  displayName: string;
  emails: string[];
  avatarUrl: string;
  profileUrl: string;
  provider: ProviderEnum;
  photos: { value: string }[];
}
