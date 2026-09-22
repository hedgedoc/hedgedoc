'use strict'
const models = require('../models')
module.exports = {
  up: async function (queryInterface, Sequelize) {
    const Op = Sequelize.Op
    try {
      await queryInterface.addColumn('Users', 'profileProvider', {
        type: Sequelize.ENUM(
          'dropbox',
          'email',
          'facebook',
          'github',
          'gitlab',
          'google',
          'ldap',
          'mattermost',
          'oauth2',
          'openid',
          'saml',
          'twitter'
        )
      })
    } catch (error) {
      if (error.message.toLowerCase().includes('duplicate column name') ||
        error.message === 'column "profileProvider" of relation "Users" already exists') {
        console.log('Migration has already run… ignoring.')
      } else {
        throw error
      }
    }
    await queryInterface.changeColumn('Users', 'profileid', {
      unique: false
    })
    await queryInterface.addIndex('Users', {
      fields: ['profileProvider'],
      name: 'user_profile_provider_index'
    })
    await queryInterface.addIndex('Users', {
      fields: ['profileid', 'profileProvider'],
      unique: true,
      name: 'user_profile_id_profile_provider_index'
    })
    await models.User.update({
      profileProvider: 'email'
    }, {
      where: {
        [Op.and]: [
          {
            email: {
              [Op.ne]: null
            }
          },
          {
            password: {
              [Op.ne]: null
            }
          }
        ]
      }
    }
    )
  },

  down: async function (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Users', 'user_profile_id_profile_provider_index')
    await queryInterface.changeColumn('Users', 'profileid', {
      unique: true
    })
    await queryInterface.removeColumn('Users', 'profileProvider')
  }
}
