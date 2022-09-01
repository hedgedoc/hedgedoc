'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'history', {
      type: Sequelize.TEXT('long')
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'history', {
      type: Sequelize.TEXT
    })
  }
}
