import { Note } from './note';
import { Table, BeforeCreate, BeforeUpdate, HasMany, Unique, IsUUID, IsEmail, Column, DataType, PrimaryKey, Model, Default } from 'sequelize-typescript';
import scrypt from 'scrypt-kdf';
import { generateAvatarURL } from '../letter-avatars';
import logger from '../logger';

var Sequelize = require('sequelize')
// core

@Table
export class User extends Model<User> {

  @PrimaryKey
  @Default(Sequelize.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column(DataType.STRING)
  profileid: string;

  @Column(DataType.TEXT)
  profile: string;

  @Column(DataType.TEXT)
  histroy: string;

  @Column(DataType.TEXT)
  accessToken: string;

  @Column(DataType.TEXT)
  refreshToken: string;

  @Column(DataType.UUID)
  deleteToken: string;

  @IsEmail
  @Column(DataType.TEXT)
  email: string;

  @Column(DataType.TEXT)
  password: string;

  verifyPassword(attempt: string) {
    return scrypt.verify(Buffer.from(this.password, 'hex'), attempt);
  }

  @HasMany(() => Note, { foreignKey: 'lastchangeuserId', constraints: false })
  @HasMany(() => Note, { foreignKey: 'ownerId', constraints: false })
  
  static parsePhotoByProfile(profile: any, bigger: boolean) {
    let photo: string;
    switch (profile.provider) {
      case 'facebook':
        photo = 'https://graph.facebook.com/' + profile.id + '/picture'
        if (bigger) photo += '?width=400'
        else photo += '?width=96'
        break
      case 'twitter':
        photo = 'https://twitter.com/' + profile.username + '/profile_image'
        if (bigger) photo += '?size=original'
        else photo += '?size=bigger'
        break
      case 'github':
        photo = 'https://avatars.githubusercontent.com/u/' + profile.id
        if (bigger) photo += '?s=400'
        else photo += '?s=96'
        break
      case 'gitlab':
        photo = profile.avatarUrl
        if (photo) {
          if (bigger) photo = photo.replace(/(\?s=)\d*$/i, '$1400')
          else photo = photo.replace(/(\?s=)\d*$/i, '$196')
        } else {
          photo = generateAvatarURL(profile.username)
        }
        break
      case 'dropbox':
        photo = generateAvatarURL('', profile.emails[0].value, bigger)
        break
      case 'google':
        photo = profile.photos[0].value
        if (bigger) photo = photo.replace(/(\?sz=)\d*$/i, '$1400')
        else photo = photo.replace(/(\?sz=)\d*$/i, '$196')
        break
      case 'ldap':
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      case 'saml':
        photo = generateAvatarURL(profile.username, profile.emails[0], bigger)
        break
      default:
        photo = generateAvatarURL(profile.username)
        break
    }
    return photo
  }
  static parseProfileByEmail(email: string) {
    return {
      name: email.substring(0, email.lastIndexOf('@')),
      photo: generateAvatarURL('', email, false),
      biggerphoto: generateAvatarURL('', email, true)
    }
  }

  @BeforeUpdate
  @BeforeCreate
  static async updatePasswordHashHook(user: User) {
    // suggested way to hash passwords to be able to do this asynchronously:
    // @see https://github.com/sequelize/sequelize/issues/1821#issuecomment-44265819

    if (!user.changed('password')) {
      return Promise.resolve();
    }

    return scrypt.kdf(user.getDataValue('password'), { logN: 15, r: 8, p: 1 }).then(keyBuf => {
      user.setDataValue('password', keyBuf.toString('hex'));
    })
  }

  static getProfile(user: User) {
    if (!user) {
      return null
    }
    return user.profile ? user.parseProfile(user.profile) : (user.email ? User.parseProfileByEmail(user.email) : null)
  }

  parseProfile(profile: any) {
    try {
      profile = JSON.parse(profile)
    } catch (err) {
      logger.error(err)
      profile = null
    }
    if (profile) {
      profile = {
        name: profile.displayName || profile.username,
        photo: User.parsePhotoByProfile(profile, false),
        biggerphoto: User.parsePhotoByProfile(profile, true)
      }
    }
    return profile
  }

}
