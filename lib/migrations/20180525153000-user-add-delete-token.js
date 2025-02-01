'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'deleteToken', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    }).catch(function (error) {
      if (error.message.toLowerCase().includes('duplicate column name') ||
        error.message === 'column "deleteToken" of relation "Users" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'deleteToken')
  }
}
