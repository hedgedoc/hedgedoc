'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'accessToken', {
      type: Sequelize.TEXT
    }).then(function () {
      return queryInterface.changeColumn('Users', 'refreshToken', {
        type: Sequelize.TEXT
      })
    })
  },

  down: async function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'accessToken', {
      type: Sequelize.STRING
    }).then(function () {
      return queryInterface.changeColumn('Users', 'refreshToken', {
        type: Sequelize.STRING
      })
    })
  }
}
