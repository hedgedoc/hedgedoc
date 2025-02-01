'use strict'

const logger = require('../../lib/logger')
const models = require('../../lib/models')

module.exports = {
  cleanup: async function () {
    logger.info('Cleaning up notes that should already have been removed. Sorry.')
    await models.Note.findAll({
      include: [{
        model: models.User,
        as: 'owner',
        attributes: ['id']
      }],
      attributes: ['id', 'ownerId']
    }).then(async function (notes) {
      for (let i = 0, noteCount = notes.length; i < noteCount; i++) {
        const item = notes[i]
        if (item.ownerId != null && !item.owner) {
          await models.Note.destroy({
            where: {
              id: item.id
            }
          })
          await models.Revision.destroy({
            where: {
              noteId: item.id
            }
          })
          await models.Author.destroy({
            where: {
              noteId: item.id
            }
          })
          logger.info(`Deleted note ${item.id} from user ${item.ownerId}`)
        }
      }
    })
    await models.Author.findAll({
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id']
      }],
      attributes: ['id', 'userId']
    }).then(async function (authors) {
      for (let i = 0, authorCount = authors.length; i < authorCount; i++) {
        const item = authors[i]
        if (item.userId != null && !item.user) {
          await models.Author.destroy({
            where: {
              id: item.id
            }
          })
          logger.info(`Deleted authorship ${item.id} from user ${item.userId}`)
        }
      }
    })

    await models.Author.findAll({
      include: [{
        model: models.Note,
        as: 'note',
        attributes: ['id']
      }],
      attributes: ['id', 'noteId']
    }).then(async function (authors) {
      for (let i = 0, authorCount = authors.length; i < authorCount; i++) {
        const item = authors[i]
        if (item.noteId != null && !item.note) {
          await models.Author.destroy({
            where: {
              id: item.id
            }
          })
          logger.info(`Deleted authorship ${item.id} from note ${item.noteId}`)
        }
      }
    })

    await models.Revision.findAll({
      include: [{
        model: models.Note,
        as: 'note',
        attributes: ['id']
      }],
      attributes: ['id', 'noteId']
    }).then(async function (revisions) {
      for (let i = 0, revisionCount = revisions.length; i < revisionCount; i++) {
        const item = revisions[i]
        if (item.noteId != null && !item.note) {
          await models.Revision.destroy({
            where: {
              id: item.id
            }
          })
          logger.info(`Deleted revision ${item.id} from note ${item.userId}`)
        }
      }
    })
  },
  up: function (queryInterface, Sequelize) {
    return this.cleanup().then(function () {
      return queryInterface.addConstraint('Notes', ['ownerId'], {
        type: 'foreign key',
        name: 'Notes_owner_fkey',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'cascade'
      })
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
