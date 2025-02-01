'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Notes', 'lastchangeuserId', {
      type: Sequelize.UUID
    }).then(function () {
      return queryInterface.addColumn('Notes', 'lastchangeAt', {
        type: Sequelize.DATE
      })
    }).catch(function (error) {
      if (error.message === 'column "lastchangeuserId" of relation "Notes" already exists' ||
        error.message.toLowerCase().includes('duplicate column name')) {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Notes', 'lastchangeAt')
      .then(function () {
        return queryInterface.removeColumn('Notes', 'lastchangeuserId')
      })
  }
}
