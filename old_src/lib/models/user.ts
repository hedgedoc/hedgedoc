import scrypt from 'scrypt-kdf'
import { UUIDV4 } from 'sequelize'
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
import { Note } from './note'

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

  verifyPassword (attempt: string): Promise<boolean> {
    return scrypt.verify(Buffer.from(this.password, 'hex'), attempt)
  }
}
