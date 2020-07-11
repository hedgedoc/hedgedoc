'use strict'
module.exports = {
  up: async function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Notes', 'lastchangeuserId', {
      type: Sequelize.UUID
    }).then(function () {
      return queryInterface.addColumn('Notes', 'lastchangeAt', {
        type: Sequelize.DATE
      })
    }).catch(function (error) {
      if (error.message === 'SQLITE_ERROR: duplicate column name: lastchangeuserId' || error.message === "ER_DUP_FIELDNAME: Duplicate column name 'lastchangeuserId'" || error.message === 'column "lastchangeuserId" of relation "Notes" already exists') {
        // eslint-disable-next-line no-console
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: async function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Notes', 'lastchangeAt')
      .then(function () {
        return queryInterface.removeColumn('Notes', 'lastchangeuserId')
      })
  }
}
