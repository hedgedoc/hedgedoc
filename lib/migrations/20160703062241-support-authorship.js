'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Notes', 'authorship', Sequelize.TEXT).then(function () {
      return queryInterface.addColumn('Revisions', 'authorship', Sequelize.TEXT)
    }).then(function () {
      return queryInterface.createTable('Authors', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        color: Sequelize.STRING,
        noteId: Sequelize.UUID,
        userId: Sequelize.UUID,
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE
      })
    }).catch(function (error) {
      if (error.message.toLowerCase().includes('duplicate column name') ||
        error.message === 'column "authorship" of relation "Notes" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Authors').then(function () {
      return queryInterface.removeColumn('Revisions', 'authorship')
    }).then(function () {
      return queryInterface.removeColumn('Notes', 'authorship')
    })
  }
}
