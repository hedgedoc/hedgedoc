'use strict'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Notes', 'lastchangeuserId', {
      type: Sequelize.UUID
    }).then(function () {
      return queryInterface.addColumn('Notes', 'lastchangeAt', {
        type: Sequelize.DATE
      })
    })
    return queryInterface.addColumn('Notes', 'viewableBy', {
      type: Sequelize.ENUM('anyone', 'signedIn', 'owner'),
      defaultValue: 'owner',
      allowNull: false
    })
    .then(function () {
      return queryInterface.addColumn('Notes', 'editableBy', {
        type: Sequelize.ENUM('anyone', 'signedIn', 'owner'),
        defaultValue: 'owner',
        allowNull: false
      })
    })
    .then(function () {
      return queryInterface.removeColumn('Notes', 'permission')
    })
    .catch(function (error) {
      if (error.message === 'SQLITE_ERROR: duplicate column name: viewableBy' || error.message === "ER_DUP_FIELDNAME: Duplicate column name 'viewableBy'" || error.message === 'column "viewableBy" of relation "Notes" already exists') {
        // eslint-disable-next-line no-console
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Notes', 'permission', {
      type: Sequelize.ENUM('freely', 'editable', 'limited', 'locked', 'protected', 'private'),
      defaultValue: 'private',
      allowNull: false
    })
      .then(function () {
        return queryInterface.removeColumn('Notes', 'viewableBy')
      })
      .then(function () {
        return queryInterface.removeColumn('Notes', 'editableBy')
      })
  }
}
