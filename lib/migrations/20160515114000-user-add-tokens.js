'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'accessToken', Sequelize.STRING).then(function () {
      return queryInterface.addColumn('Users', 'refreshToken', Sequelize.STRING)
    }).catch(function (error) {
      if (error.message.toLowerCase().includes('duplicate column name') ||
        error.message === 'column "accessToken" of relation "Users" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'accessToken').then(function () {
      return queryInterface.removeColumn('Users', 'refreshToken')
    })
  }
}
