import {Sequelize} from 'sequelize-typescript';
import { Author } from './author';
import { Note } from './note';
import { Revision } from './revision';
import { Temp } from './temp';
import { User } from './user';
var fs = require('fs')
var path = require('path');
const { cloneDeep } = require('lodash')

// core
var config = require('../config')
var logger = require('../logger')

var dbconfig = cloneDeep(config.db)
dbconfig.logging = config.debug ? (data) => {
  logger.info(data)
} : false

var sequelize: any = null;

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
  if (data === undefined) return data
  else if (process) {
    if (data === null) {
      return _default
    } else {
      return process(data)
    }
  } else {
    if (data === null) {
      return _default
    } else {
      return data
    }
  }
}
sequelize.processData = processData

var db: any = {}

sequelize.addModels([Author, Note, Revision, Temp, User]);

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
