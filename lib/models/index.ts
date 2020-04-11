import {Sequelize} from 'sequelize-typescript';
import {Author} from './author';
import {Note} from './note';
import {Revision} from './revision';
import {Temp} from './temp';
import {User} from './user';

const {cloneDeep} = require('lodash')

// core
var config = require('../config')
var logger = require('../logger')

var dbconfig = cloneDeep(config.db)
dbconfig.logging = config.debug ? (data) => {
  logger.info(data)
} : false

export let sequelize: any;

// Heroku specific
if (config.dbURL) {
  sequelize = new Sequelize(config.dbURL, dbconfig)
} else {
  sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, dbconfig)
}

sequelize.addModels([Author, Note, Revision, Temp, User]);


export {Author, Note, Revision, Temp, User};

