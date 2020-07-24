import { generateAvatarURL } from '../letter-avatars'
import { logger } from '../logger'
import { PassportProfile, ProviderEnum } from '../web/auth/utils'
import { User } from '../models'

export class PhotoProfile {
  name: string
  photo: string
  biggerphoto: string

  static fromUser (user: User): PhotoProfile | null {
    if (!user) return null
    if (user.profile) return PhotoProfile.fromJSON(user.profile)
    if (user.email) return PhotoProfile.fromEmail(user.email)
    return null
  }

  private static fromJSON (jsonProfile: string): PhotoProfile | null {
    try {
      const parsedProfile: PassportProfile = JSON.parse(jsonProfile)
      return {
        name: parsedProfile.displayName || parsedProfile.username,
        photo: PhotoProfile.generatePhotoURL(parsedProfile, false),
        biggerphoto: PhotoProfile.generatePhotoURL(parsedProfile, true)
      }
    } catch (err) {
      logger.error(err)
      return null
    }
  }

  private static fromEmail (email: string): PhotoProfile {
    return {
      name: email.substring(0, email.lastIndexOf('@')),
      photo: generateAvatarURL('', email, false),
      biggerphoto: generateAvatarURL('', email, true)
    }
  }

  private static generatePhotoURL (profile: PassportProfile, bigger: boolean): string {
    let photo: string
    switch (profile.provider) {
      case ProviderEnum.facebook:
        photo = 'https://graph.facebook.com/' + profile.id + '/picture'
        if (bigger) {
          photo += '?width=400'
        } else {
          photo += '?width=96'
        }
        break
      case ProviderEnum.twitter:
        photo = 'https://twitter.com/' + profile.username + '/profile_image'
        if (bigger) {
          photo += '?size=original'
        } else {
          photo += '?size=bigger'
        }
        break
      case ProviderEnum.github:
        photo = 'https://avatars.githubusercontent.com/u/' + profile.id
        if (bigger) {
          photo += '?s=400'
        } else {
          photo += '?s=96'
        }
        break
      case ProviderEnum.gitlab:
        photo = profile.avatarUrl
        if (photo) {
          if (bigger) {
            photo = photo.replace(/(\?s=)\d*$/i, '$1400')
          } else {
            photo = photo.replace(/(\?s=)\d*$/i, '$196')
          }
        } else {
          photo = generateAvatarURL(profile.username)
        }
        break
      case ProviderEnum.dropbox:
        photo = generateAvatarURL('', profile.emails[0], bigger)
        break
      case ProviderEnum.google:
        photo = profile.photos[0].value
        if (bigger) {
          photo = photo.replace(/(\?sz=)\d*$/i, '$1400')
        } else {
          photo = photo.replace(/(\?sz=)\d*$/i, '$196')
        }
        break
      case ProviderEnum.ldap:
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      case ProviderEnum.saml:
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      default:
        photo = generateAvatarURL(profile.username)
        break
    }
    return photo
  }
}
