'use strict'

module.exports = {
  up: async function (queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize
    const dialect = sequelize.getDialect()

    // PostgreSQL supports transactions with sequelize, so use them in that case
    const transaction = dialect === 'postgres' ? await sequelize.transaction() : undefined
    const options = { transaction }

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
      }, options)

      // Local accounts are identified by a non-null password hash.
      // External accounts stay null and acquire their provider on their next login.
      const users = queryInterface.quoteIdentifier('Users')
      const provider = queryInterface.quoteIdentifier('profileProvider')
      const password = queryInterface.quoteIdentifier('password')
      await sequelize.query(`UPDATE ${users} SET ${provider} = 'email' WHERE ${password} IS NOT NULL`, options)

      await queryInterface.addIndex('Users', ['profileProvider'], { ...options, name: 'user_profile_provider_index' })
      await queryInterface.addIndex('Users', ['profileid', 'profileProvider'], {
        ...options,
        name: 'user_profile_id_profile_provider_index',
        unique: true
      })
      if (transaction !== undefined) {
        await transaction.commit()
      }
    } catch (error) {
      if (transaction !== undefined) {
        await transaction.rollback()
      }
      throw error
    }
  }
}
