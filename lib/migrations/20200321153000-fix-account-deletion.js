'use strict'
const { spawnSync } = require('child_process')
const path = require('path')
module.exports = {
  up: function (queryInterface, Sequelize) {
    const cleanup = spawnSync('./bin/cleanup', { cwd: path.resolve(__dirname, '../../') })
    if (cleanup.status !== 0) {
      throw new Error('Unable to cleanup')
    }
    return queryInterface.addConstraint('Notes', ['ownerId'], {
      type: 'foreign key',
      name: 'Notes_owner_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade'
    }).then(function () {
      return queryInterface.addConstraint('Revisions', ['noteId'], {
        type: 'foreign key',
        name: 'Revisions_note_fkey',
        references: {
          table: 'Notes',
          field: 'id'
        },
        onDelete: 'cascade'
      })
    }).then(function () {
      return queryInterface.addConstraint('Authors', ['noteId'], {
        type: 'foreign key',
        name: 'Author_note_fkey',
        references: {
          table: 'Notes',
          field: 'id'
        },
        onDelete: 'cascade'
      })
    }).then(function () {
      return queryInterface.addConstraint('Authors', ['userId'], {
        type: 'foreign key',
        name: 'Author_user_fkey',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'cascade'
      })
    }).catch(function (error) {
      if (error.message.toLowerCase().includes('duplicate key on write or update')) {
        // eslint-disable-next-line no-console
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeConstraint('Notes', 'Notes_owner_fkey')
      .then(function () {
        return queryInterface.removeConstraint('Revisions', 'Revisions_note_fkey')
      }).then(function () {
        return queryInterface.removeConstraint('Authors', 'Author_note_fkey')
      }).then(function () {
        return queryInterface.removeConstraint('Authors', 'Author_user_fkey')
      })
  }
}
