'use strict'
module.exports = {
  up: async function (queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      profileid: {
        type: Sequelize.STRING,
        unique: true
      },
      profile: Sequelize.TEXT,
      history: Sequelize.TEXT,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    })
  },

  down: async function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Users')
  }
}
