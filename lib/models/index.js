'use strict'
// external modules
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const { cloneDeep } = require('lodash')
const Umzug = require('umzug')

// core
const config = require('../config')
const logger = require('../logger')
const { isSQLite } = require('../utils')

const dbconfig = cloneDeep(config.db)
dbconfig.logging = config.debug
  ? (data) => {
      logger.info(data)
    }
  : false

let sequelize = null

// Heroku specific
if (config.dbURL) {
  sequelize = new Sequelize(config.dbURL, dbconfig)
} else {
  sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, dbconfig)
}

// [Postgres] Handling NULL bytes
// https://github.com/sequelize/sequelize/issues/6485
function stripNullByte (value) {
  value = '' + value
  // eslint-disable-next-line no-control-regex
  return value ? value.replace(/\u0000/g, '') : value
}

sequelize.stripNullByte = stripNullByte

function processData (data, _default, process) {
  if (data === undefined) {
    return data
  } else {
    return data === null ? _default : (process ? process(data) : data)
  }
}

sequelize.processData = processData

const db = {}

fs.readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function (file) {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

const umzug = new Umzug({
  migrations: {
    path: path.resolve(__dirname, '..', 'migrations'),
    params: [
      sequelize.getQueryInterface(),
      Sequelize.DataTypes
    ]
  },
  // Required wrapper function required to prevent winstion issue
  // https://github.com/winstonjs/winston/issues/1577
  logging: message => {
    logger.info(message)
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize
  }
})

db.runMigrations = async function runMigrations () {
  // checks migrations and run them if they are not already applied
  // exit in case of unsuccessful migrations
  const savepointName = 'migration'
  try {
    if (isSQLite(sequelize)) {
      // Deactivate foreign_keys for sqlite, so that sequelize does not accidentally delete data when recreating tables via cascading delete.
      // See https://github.com/hedgedoc/hedgedoc/issues/2809
      await sequelize.query('PRAGMA foreign_keys = OFF;')
      await this.sequelize.query(`SAVEPOINT ${savepointName};`)
    }
    await umzug.up()
    if (isSQLite(sequelize)) {
      // Run a foreign keys integrity check
      const foreignKeyCheckResult = await sequelize.query('PRAGMA foreign_key_check;', { type: sequelize.QueryTypes.SELECT })
      if (foreignKeyCheckResult.length > 0) {
        throw Error(`Foreign key violations detected: ${JSON.stringify(foreignKeyCheckResult, null, 2)}`)
      }
      await this.sequelize.query(`RELEASE ${savepointName};`)
    }
  } catch (error) {
    if (isSQLite(sequelize)) {
      await this.sequelize.query(`ROLLBACK TO ${savepointName};`)
    }
    logger.error(error)
    logger.error(`Database migration failed.
This can be the result of upgrading from quite old versions and requires manual database intervention.
See https://docs.hedgedoc.org/guides/migration-troubleshooting/ for help.
Exiting…`)
    process.exit(1)
  } finally {
    if (isSQLite(sequelize)) {
      await sequelize.query('PRAGMA foreign_keys = ON;')
    }
  }
  logger.info('All migrations performed successfully')
}

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
