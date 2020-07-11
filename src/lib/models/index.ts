import { Sequelize } from 'sequelize-typescript'
import { cloneDeep } from 'lodash'
import * as path from 'path'
import { Author } from './author'
import { Note } from './note'
import { Revision } from './revision'
import { Temp } from './temp'
import { User } from './user'
import { logger } from '../logger'
import { config } from '../config'
import Umzug from 'umzug'
import SequelizeTypes from 'sequelize'

const dbconfig = cloneDeep(config.db)
dbconfig.logging = config.debug ? (data): void => {
  logger.info(data)
} : false

export let sequelize: Sequelize

// Heroku specific
if (config.dbURL) {
  sequelize = new Sequelize(config.dbURL, dbconfig)
} else {
  sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, dbconfig)
}

const umzug = new Umzug({
  migrations: {
    path: path.resolve(__dirname, '..', 'migrations'),
    params: [
      sequelize.getQueryInterface(),
      SequelizeTypes
    ]
  },
  // Required wrapper function required to prevent winstion issue
  // https://github.com/winstonjs/winston/issues/1577
  logging: message => {
    logger.info(message)
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize
  }
})

export async function runMigrations(): Promise<void> {
  // checks migrations and run them if they are not already applied
  // exit in case of unsuccessful migrations
  await umzug.up().catch(error => {
    logger.error(error)
    logger.error('Database migration failed. Exiting…')
    process.exit(1)
  })
  logger.info('All migrations performed successfully')
}

sequelize.addModels([Author, Note, Revision, Temp, User])

export { Author, Note, Revision, Temp, User }
