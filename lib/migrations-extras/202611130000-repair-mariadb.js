const TABLE_USERS = 'Users'

async function repairMariaDB (queryInterface) {
  const sequelize = queryInterface.sequelize
  const columns = await queryInterface.describeTable(TABLE_USERS)
  const indexes = await queryInterface.showIndex(TABLE_USERS)

  // Iterate over all indexes to identify wrong ones and remove them
  for (const index of indexes) {
    const fields = index.fields.map(field => field.attribute)
    const providerIndex = fields.includes('profileProvider')
    const singleUnique = index.unique && fields.length === 1 && ['email', 'profileid'].includes(fields[0])

    // Keep indexes not matching the problematic ones
    if (!providerIndex && !singleUnique) {
      continue
    }

    // Remove wrong indexes
    await queryInterface.removeIndex(TABLE_USERS, index.name)
  }

  // If the profileProvider column exists, remove it so that the next migration can re-add it correctly
  if (columns.profileProvider) {
    await sequelize.query(`ALTER TABLE \`${TABLE_USERS}\` DROP COLUMN \`profileProvider\``)
  }

  // Revert the email column back to TEXT type
  await sequelize.query(`ALTER TABLE \`${TABLE_USERS}\` MODIFY COLUMN \`email\` TEXT`)
}

module.exports = { repairMariaDB }
