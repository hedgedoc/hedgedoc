'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING
    }).then(function () {
      return queryInterface.addIndex('Users', ['email'], {
        unique: true
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeIndex('Users', ['email']).then(function () {
      return queryInterface.changeColumn('Users', 'email', {
        type: Sequelize.TEXT
      })
    })
  }
}
