'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'email', Sequelize.TEXT).then(function () {
      return queryInterface.addColumn('Users', 'password', Sequelize.TEXT).catch(function (error) {
        if (error.message.toLowerCase().includes('duplicate column name') ||
          error.message === 'column "password" of relation "Users" already exists') {
          console.log('Migration has already run… ignoring.')
        } else {
          throw error
        }
      })
    }).catch(function (error) {
      if (error.message.toLowerCase().includes('duplicate column name') ||
        error.message === 'column "email" of relation "Users" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'email').then(function () {
      return queryInterface.removeColumn('Users', 'password')
    })
  }
}
