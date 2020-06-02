'use strict'
module.exports = {
  up: async function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Users', 'deleteToken', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    })
  },

  down: async function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Users', 'deleteToken')
  }
}
