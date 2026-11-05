'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize
    const dialect = sequelize.getDialect()

    // Since Sequelize changeColumn rebuilds a table completely, all indexes get lost on it.
    // We therefore do a per-database direct SQL command to add our required uniqueness.
    // PostgreSQL and SQLite support indexes on TEXT columns, so not too much work there,
    // MariaDB needs some more special treatment. Since we convert from TEXT to 255 character
    // long VARCHAR we need to check for longer entries first. Although they shouldn't exist
    // we don't want to break databases once more.

    if (dialect === 'sqlite' || dialect === 'postgres') {
      await sequelize.query('CREATE UNIQUE INDEX "users_email" ON "Users" ("email")')
    } else if (dialect === 'mariadb' || dialect === 'mysql') {
      const tooLong = await sequelize.query('SELECT 1 FROM `Users` WHERE CHAR_LENGTH(`email`) > 255 LIMIT 1', {
        type: Sequelize.QueryTypes.SELECT
      })
      if (tooLong.length > 0) {
        throw new Error('Users table contains email addresses longer than 255 characters. Fix this before upgrading.')
      }
      const duplicates = await sequelize.query('SELECT 1 FROM `Users` WHERE `email` IS NOT NULL GROUP BY `email` HAVING COUNT(*) > 1 LIMIT 1', {
        type: Sequelize.QueryTypes.SELECT
      })
      if (duplicates.length > 0) {
        throw new Error('Users table contains duplicate email addresses. Fix this before upgrading.')
      }
      await sequelize.query('ALTER TABLE `Users` MODIFY COLUMN `email` VARCHAR(255), ADD UNIQUE INDEX `users_email` (`email`)')
    }
  },

  down: async function (queryInterface) {
    const sequelize = queryInterface.sequelize
    const dialect = sequelize.getDialect()
    if (dialect === 'sqlite' || dialect === 'postgres') {
      await sequelize.query('DROP INDEX "users_email"')
    } else if (dialect === 'mariadb' || dialect === 'mysql') {
      await sequelize.query('ALTER TABLE `Users` DROP INDEX `users_email`, MODIFY COLUMN `email` TEXT')
    }
  }
}
