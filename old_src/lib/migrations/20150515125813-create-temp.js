'use strict'
module.exports = {
  up: async function (queryInterface, Sequelize) {
    return queryInterface.createTable('Temp', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      date: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: async function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Temp')
  }
}
