const TABLE_USERS = 'Users'
const TYPE_PROVIDER = 'enum_Users_profileProvider'

async function repairPostgreSQL (queryInterface) {
  const sequelize = queryInterface.sequelize

  const columns = await queryInterface.describeTable(TABLE_USERS)
  const indexes = await queryInterface.showIndex(TABLE_USERS)

  // Iterate over all indexes to identify wrong ones and remove them
  for (const index of indexes) {
    const fields = index.fields.map(field => field.attribute)
    const providerIndex = fields.includes('profileProvider')
    const singleUnique = index.unique && fields.length === 1 && ['email', 'profileid'].includes(fields[0])

    // Keep indexes that are not matching our broken ones
    if (!providerIndex && !singleUnique) {
      continue
    }

    // PostgreSQL can only drop indexes without constraints. Therefore we have to manually remove the constraints
    // using low-level PostgreSQL metadata.
    // See https://www.postgresql.org/docs/current/catalog-pg-constraint.html and
    // https://www.postgresql.org/docs/current/catalog-pg-class.html
    const constraints = await sequelize.query(
      `SELECT constraints.conname FROM pg_constraint AS constraints
       JOIN pg_class AS indexes ON indexes.oid = constraints.conindid
       WHERE constraints.conrelid = '"${TABLE_USERS}"'::regclass
       AND indexes.relname = :indexName AND constraints.contype = 'u'`,
      {
        replacements: { indexName: index.name },
        type: sequelize.QueryTypes.SELECT
      }
    )

    if (constraints.length > 0) {
      const name = queryInterface.quoteIdentifier(constraints[0].conname)
      // This drops the index as well automatically
      // https://www.postgresql.org/docs/19/sql-altertable.html#SQL-ALTERTABLE-DESC-DROP-CONSTRAINT
      await sequelize.query(`ALTER TABLE "${TABLE_USERS}" DROP CONSTRAINT ${name}`)
    } else {
      await queryInterface.removeIndex(TABLE_USERS, index.name)
    }
  }

  // If the profileProvider column exists, remove it so that the next migration can re-add it correctly
  if (columns.profileProvider) {
    await sequelize.query(`ALTER TABLE "${TABLE_USERS}" DROP COLUMN "profileProvider"`)
  }

  // PostgreSQL created an enum type which might still be around and make problems when applying follow-up migrations
  await sequelize.query(`DROP TYPE IF EXISTS "${TYPE_PROVIDER}"`)

  // Revert the email column back to TEXT type
  await sequelize.query(`ALTER TABLE "${TABLE_USERS}" ALTER COLUMN "email" TYPE TEXT`)
}

module.exports = { repairPostgreSQL }
