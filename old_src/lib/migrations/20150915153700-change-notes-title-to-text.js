'use strict'
function isSQLite (sequelize) {
  return sequelize.options.dialect === 'sqlite'
}

module.exports = {
  up: async function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Notes', 'title', {
      type: Sequelize.TEXT
    }).then(function () {
      if (isSQLite(queryInterface.sequelize)) {
        // manual added index will be removed in sqlite
        return queryInterface.addIndex('Notes', ['shortid'])
      }
    })
  },

  down: async function (queryInterface, Sequelize) {
    return queryInterface.changeColumn('Notes', 'title', {
      type: Sequelize.STRING
    }).then(function () {
      if (isSQLite(queryInterface.sequelize)) {
        // manual added index will be removed in sqlite
        return queryInterface.addIndex('Notes', ['shortid'])
      }
    })
  }
}
