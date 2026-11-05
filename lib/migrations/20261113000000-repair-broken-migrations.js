'use strict'

const { repairSQLiteUsers } = require('../migrations-extras/202611130000-repair-sqlite')
const { repairPostgreSQL } = require('../migrations-extras/202611130000-repair-postgresql')
const { repairMariaDB } = require('../migrations-extras/202611130000-repair-mariadb')

// HedgeDoc 1.12.1 and 1.12.2 introduced two broken migrations for adding a profileProvider column to the users table as
// well as adding a UNIQUE index for the email field of the users table.
// Databases that were used with 1.12.1 or 1.12.2 might contain additional or wrong columns and indexes which either
// hinder HedgeDoc from starting, or at least create problems with follow-up migrations.
// We removed the broken migrations from the code base so that new instances and those upgrading from 1.12.0 to 1.12.3
// directly do not apply them anymore. However, in order to repair the databases broken by 1.12.1 or 1.12.2, this
// migration reverts the changes back to a state consistent with 1.12.0, so that the following migrations can be
// applied successfully.
// This migration therefore has no `down` way either, since a repair should not be undone and can't be treated like a
// regular migration.

module.exports = {
  up: async function (queryInterface) {
    const sequelize = queryInterface.sequelize
    const dialect = sequelize.getDialect()

    // SQLite rolled back changes after the failing migration quite well when upgrading from 1.12.0 to 1.12.1 or 1.12.2.
    // Fresh 1.12.2 instances and some instances where the migration failed midway need some repair though.
    // To find out the state of the database and apply fixes, this uses some SQLite-specific metadata inspection and
    // modification.
    if (dialect === 'sqlite') {
      await repairSQLiteUsers(queryInterface)
      return
    }

    // When the migration in PostgreSQL failed midway, most changes were rolled back except for some indexes which
    // could be wrong as well as an enum for the profile provider column which hinders re-running the migration that
    // adds that.
    if (dialect === 'postgres') {
      await repairPostgreSQL(queryInterface)
      return
    }

    // MariaDB retained the old single-column profile ID index, as well as
    // provider and email objects added by successful upgrades.
    if (dialect === 'mariadb' || dialect === 'mysql') {
      await repairMariaDB(queryInterface)
      return
    }

    throw new Error(`Unsupported database dialect: ${dialect}`)
  }
}
