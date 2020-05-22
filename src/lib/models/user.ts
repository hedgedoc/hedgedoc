import { Note } from './note'
import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  HasMany,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript'
import scrypt from 'scrypt-kdf'
import { generateAvatarURL } from '../letter-avatars'
import { logger } from '../logger'
import { UUIDV4 } from 'sequelize'

// core

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

// ToDo Fix this 'any' mess
export type Profile = {
  id: string;
  username: string;
  displayName: string;
  emails: string[];
  avatarUrl: string;
  profileUrl: string;
  provider: ProviderEnum;
  photos: any[];
}

export type PhotoProfile = {
  name: string;
  photo: string;
  biggerphoto: string;
}

@Table
export class User extends Model<User> {
  @PrimaryKey
  @Default(UUIDV4)
  @Column(DataType.UUID)
  id: string

  @Unique
  @Column(DataType.STRING)
  profileid: string

  @Column(DataType.TEXT)
  profile: string

  @Column(DataType.TEXT)
  history: string

  @Column(DataType.TEXT)
  accessToken: string

  @Column(DataType.TEXT)
  refreshToken: string

  @Column(DataType.UUID)
  deleteToken: string

  @IsEmail
  @Column(DataType.TEXT)
  email: string

  @Column(DataType.TEXT)
  password: string

  @HasMany(() => Note, { foreignKey: 'lastchangeuserId', constraints: false })
  @HasMany(() => Note, { foreignKey: 'ownerId', constraints: false })

  static parsePhotoByProfile (profile: Profile, bigger: boolean): string {
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

  static parseProfileByEmail (email: string): PhotoProfile {
    return {
      name: email.substring(0, email.lastIndexOf('@')),
      photo: generateAvatarURL('', email, false),
      biggerphoto: generateAvatarURL('', email, true)
    }
  }

  @BeforeUpdate
  @BeforeCreate
  static async updatePasswordHashHook (user: User): Promise<void> {
    // suggested way to hash passwords to be able to do this asynchronously:
    // @see https://github.com/sequelize/sequelize/issues/1821#issuecomment-44265819

    if (!user.changed('password')) {
      return Promise.resolve()
    }

    return scrypt
      .kdf(user.getDataValue('password'), { logN: 15, r: 8, p: 1 })
      .then(keyBuf => {
        user.setDataValue('password', keyBuf.toString('hex'))
      })
  }

  static getProfile (user: User): PhotoProfile | null {
    if (!user) {
      return null
    }

    if (user.profile) {
      return user.parseProfile(user.profile)
    } else {
      if (user.email) {
        return User.parseProfileByEmail(user.email)
      } else {
        return null
      }
    }
  }

  verifyPassword (attempt: string): Promise<boolean> {
    return scrypt.verify(Buffer.from(this.password, 'hex'), attempt)
  }

  parseProfile (profile: string): PhotoProfile | null {
    try {
      const parsedProfile: Profile = JSON.parse(profile)
      return {
        name: parsedProfile.displayName || parsedProfile.username,
        photo: User.parsePhotoByProfile(parsedProfile, false),
        biggerphoto: User.parsePhotoByProfile(parsedProfile, true)
      }
    } catch (err) {
      logger.error(err)
      return null
    }
  }
}
