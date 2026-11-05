const TABLE_USERS = 'Users'
const TABLE_BACKUP = 'Users_backup'
const TABLE_REPAIR = 'Users_repair'

const REGEX_SINGLE_UNIQUE_CONSTRAINT = /^(?:CONSTRAINT\s+\S+\s+)?UNIQUE\s*\(\s*[`"[]?(email|profileid|profileProvider)[`"\]]?\s*\)\s*$/i
const REGEX_USER_COLUMN = /^(\s*[`"[]?(email|profileid)[`"\]]?\s+)(TEXT|VARCHAR\(\d+\))(?:\s+UNIQUE\b)?/i

async function repairSQLiteUsers (queryInterface) {
  const sequelize = queryInterface.sequelize

  // Ensure that foreign key checks are disabled while we make raw database operations, otherwise data might be lost
  const foreignKeys = await sequelize.query('PRAGMA foreign_keys', { type: sequelize.QueryTypes.SELECT })
  if (foreignKeys[0].foreign_keys !== 0) {
    throw new Error('Foreign keys should be disabled, aborting for safety reasons.')
  }

  // The sequelize migrations with umzug create a backup table (*_backup) when modifying columns or specific other
  // attributes. This repair migration creates a temporary repair table as well. Before starting, we should check that
  // no pending repair table is already existing. Also, we should see whether a backup table is present which might
  // mean that the previous migration aborted.
  const tables = await sequelize.query(
    `SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name IN ('${TABLE_USERS}', '${TABLE_BACKUP}', '${TABLE_REPAIR}')`,
    {
      type: sequelize.QueryTypes.SELECT
    }
  )
  if (tables.some(table => table.name === TABLE_REPAIR)) {
    throw new Error('A schema repair table is already present. This could mean that a repair migration is currently running or was aborted.')
  }

  // It should not be possible with the broken migrations from HedgeDoc 1.12.1 and 1.12.2 to get both users and backup
  // table removed. But if that happened, we can't do anything anymore.
  let usersTableDefinition = tables.find(table => table.name === TABLE_USERS)
  const backupTableDefinition = tables.find(table => table.name === TABLE_BACKUP)
  if ((!usersTableDefinition && !backupTableDefinition)) {
    throw new Error('Neither a user table nor migration backup table was found in the database. Something is horribly broken. Restore a backup.')
  }

  if (backupTableDefinition) {
    const backupColumns = await queryInterface.describeTable(TABLE_BACKUP)
    const backupColumnNames = Object.keys(backupColumns)
    const backupFields = backupColumnNames.map(column => queryInterface.quoteIdentifier(column)).join(', ')

    // When the original users table does not exist anymore but the backup table exists, we copy over the backup table to
    // a new users table.
    if (!usersTableDefinition) {
      if (!backupColumns.id || !backupColumns.id.primaryKey) {
        throw new Error('The migration backup table is missing primary key. Something is horribly broken. Restore a backup.')
      }
      const sqlDefinition = backupTableDefinition.sql.slice(backupTableDefinition.sql.indexOf('('))
      const createTableSql = `CREATE TABLE "${TABLE_USERS}" ${sqlDefinition}`
      await sequelize.query(createTableSql)
      await sequelize.query(`INSERT INTO "${TABLE_USERS}" (${backupFields}) SELECT ${backupFields} FROM "${TABLE_BACKUP}"`)
      usersTableDefinition = { name: TABLE_USERS, sql: createTableSql }
    }

    // Finally, compare the data from the backup table with the actual users table. If they differ, there seems to be
    // some data-loss problem which can only be recovered by restoring a database backup.
    const differences = await sequelize.query(
      `SELECT ${backupFields} FROM "${TABLE_BACKUP}" EXCEPT SELECT ${backupFields} FROM "Users"`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    )
    if (differences.length > 0) {
      throw new Error('The migration backup table contains conflicting data. Something is horribly broken. Restore a backup.')
    }
  }

  // If the primary key is missing in the actual users table now, something other than the 1.12.1/1.12.2 migrations
  // happened (manual repair attempt?). We can't do anything about that.
  const columns = await queryInterface.describeTable(TABLE_USERS)
  const columnNames = Object.keys(columns)
  if (!columns.id || !columns.id.primaryKey) {
    throw new Error('The users table is missing its primary key. Something is horribly broken. Restore a backup.')
  }

  // The failing migration created single UNIQUE indexes on the email, profileid and profileProvider columns.
  // This resulted in only one account per provider being accepted and therefore some of the reported bugs.
  // We want one UNIQUE index on email and another one on the combination of profileid and profileProvider.
  // Since this migration's intent is to restore a clean 1.12.0-like state, the (correct) index on the email column
  // needs to go as well.
  const indexes = await queryInterface.showIndex(TABLE_USERS)
  const unwantedIndexes = indexes.filter(index =>
    // Only UNIQUE indexes are relevant
    index.unique &&
    // Only indexes over exactly one column are relevant
    index.fields.length === 1 &&
    // Only indexes of these three columns are relevant
    ['email', 'profileid', 'profileProvider'].includes(index.fields[0].attribute))
  for (const index of indexes) {
    if (!index.fields.some(field => field.attribute === 'profileProvider')) continue
    if (unwantedIndexes.includes(index)) continue
    const composite = index.unique && index.fields.length === 2 && index.fields.some(field => field.attribute === 'profileid')
    if (!composite && !['user_profile_provider_index', 'user_profile_id_profile_provider_index'].includes(index.name)) {
      throw new Error('Users has a custom provider index. Preserve its definition before upgrading.')
    }
    unwantedIndexes.push(index)
  }

  // We need to rebuild the table in either of these cases:
  // 1. There are SQLite auto-created indexes, since they collide with our manual created ones.
  // 2. The email column is NOT of type TEXT. In 1.12.0 it was TEXT, but we (tried to) change it for the index.
  // 3. The profileProvider column exists and needs to be removed.
  const needsRebuild = unwantedIndexes.some(index => index.name.startsWith('sqlite_autoindex_')) ||
    columns.email.type !== 'TEXT' ||
    !!columns.profileProvider

  // This is the simplest case. We can just remove the unnecessary indexes and the migration backup table if present.
  if (!needsRebuild) {
    for (const index of unwantedIndexes) {
      await queryInterface.removeIndex(TABLE_USERS, index.name)
    }
    if (backupTableDefinition) {
      await sequelize.query(`DROP TABLE "${TABLE_BACKUP}"`)
    }
    return
  }

  // We need to rebuild the table by using the SQL definition of the existing table and modify it accordingly.
  // This requires some manual parsing of the SQL so that we keep the original constraints, etc. and just modify
  // the UNIQUE indexes and email column type.

  // Extract the table definition from the SQL
  const firstParenthesis = usersTableDefinition.sql.indexOf('(')
  const lastParenthesis = usersTableDefinition.sql.lastIndexOf(')')
  const sqlDefinition = usersTableDefinition.sql.slice(firstParenthesis + 1, lastParenthesis)

  // Split definitions, but since commas could be placed inside constraints or enums etc, we need to parse this
  const definitions = parseDefinitions(sqlDefinition)
  const repairedDefinitions = []

  for (let definition of definitions) {
    // Discard the old provider assignments so the following migration can add
    // a clean column and use the legacy login flow for external accounts.
    if (/^\s*[`"[]?profileProvider[`"\]]?\s+/i.test(definition)) {
      continue
    }
    // Skip an explicit constraint for uniqueness of a single column (not part of column description)
    if (REGEX_SINGLE_UNIQUE_CONSTRAINT.test(definition.trim())) {
      continue
    }
    if (/\bprofileProvider\b/i.test(definition)) {
      const unique = definition.match(/^\s*(?:CONSTRAINT\s+\S+\s+)?UNIQUE\s*\(([^)]+)\)\s*$/i)
      const fields = unique ? unique[1].split(',').map(field => field.replace(/[`"[\]\s]/g, '')) : []
      if (fields.length === 2 && fields.includes('profileid') && fields.includes('profileProvider')) continue
      throw new Error('Users has a custom provider constraint. Preserve its definition before upgrading.')
    }

    // Check whether the column definition matches the ones which could be broken by the migrations
    const column = definition.match(REGEX_USER_COLUMN)
    if (column) {
      // Remove the UNIQUE constraints if present
      // Replace only the declared type, not text inside a DEFAULT or CHECK.
      const type = column[2].toLowerCase() === 'email' ? 'TEXT' : column[3]
      definition = definition.replace(REGEX_USER_COLUMN, () => column[1] + type)
    }
    repairedDefinitions.push(definition)
  }

  // Store the original index and trigger SQL for the users table, so that we can recreate them later
  const originalIndexesAndTriggers = await sequelize.query(
    `SELECT name, sql FROM sqlite_master WHERE tbl_name = '${TABLE_USERS}' AND type IN ('index', 'trigger') AND sql IS NOT NULL ORDER BY type, name`,
    {
      type: sequelize.QueryTypes.SELECT
    }
  )
  for (const object of originalIndexesAndTriggers) {
    if (!unwantedIndexes.some(index => index.name === object.name) && /\bprofileProvider\b/i.test(object.sql)) {
      throw new Error('Users has a custom provider-dependent schema object. Preserve its definition before upgrading.')
    }
  }

  // Rebuild the SQL for the definition of the corrected Users table
  const usersRepairTableSchema = `(${repairedDefinitions.join(',')}${usersTableDefinition.sql.slice(lastParenthesis)}`

  await sequelize.query('SAVEPOINT repair_users')
  try {
    // Create repair table
    await sequelize.query(`CREATE TABLE "${TABLE_REPAIR}" ${usersRepairTableSchema}`)

    // Check that repair table does not have the same invalid indexes as before the repair
    const rebuiltIndexes = await queryInterface.showIndex(TABLE_REPAIR)
    if (rebuiltIndexes.some(index =>
      index.unique &&
      index.fields.length === 1 &&
      ['email', 'profileid', 'profileProvider'].includes(index.fields[0].attribute))) {
      throw new Error('The new users table has invalid unique indexes. This cannot be resolved anymore. Restore a backup.')
    }

    // Copy the data from the original users table into the repair table, and delete the old one, do not keep the profileProvider column
    const fields = columnNames
      .filter(column => column !== 'profileProvider')
      .map(column => queryInterface.quoteIdentifier(column))
      .join(', ')
    await sequelize.query(`INSERT INTO "${TABLE_REPAIR}" (${fields}) SELECT ${fields} FROM "${TABLE_USERS}"`)
    await sequelize.query(`DROP TABLE "${TABLE_USERS}"`)

    // Recreate the users table and copy the data from the repair table back, delete the repair table afterwards
    await sequelize.query(`CREATE TABLE "${TABLE_USERS}" ${usersRepairTableSchema}`)
    await sequelize.query(`INSERT INTO "${TABLE_USERS}" (${fields}) SELECT ${fields} FROM "${TABLE_REPAIR}"`)
    await sequelize.query(`DROP TABLE "${TABLE_REPAIR}"`)

    // Recreate the original indexes and triggers, except for the ones that were wrong
    for (const object of originalIndexesAndTriggers) {
      if (!unwantedIndexes.some(index => index.name === object.name)) {
        await sequelize.query(object.sql)
      }
    }

    // Remove the backup table if it still exists
    if (backupTableDefinition) {
      await sequelize.query(`DROP TABLE "${TABLE_BACKUP}"`)
    }

    // Check that all foreign key relations are correct
    const violations = await sequelize.query('PRAGMA foreign_key_check', {
      type: sequelize.QueryTypes.SELECT
    })
    if (violations.length > 0) {
      throw new Error('Foreign key check found violations. The database could not be repaired automatically. Restore a backup.')
    }

    // Everything seems to be repaired at this point!
    await sequelize.query('RELEASE repair_users')
  } catch (error) {
    // On errors, revert to the save point
    await sequelize.query('ROLLBACK TO repair_users')
    await sequelize.query('RELEASE repair_users')
    throw error
  }
}

/**
 * Parses a given string of SQL definitions into a list of database columns with their extras.
 * Since commas could be nested inside brackets, we can't simply split by commas.
 *
 * @param sqlDefintions {string} The complete SQL definition of the columns
 * @returns {string[]} The column definitions separated as an array
 */
function parseDefinitions (sqlDefintions) {
  const rawDefinitions = []

  let position = 0
  let currentDefinitionStart = 0

  let depth = 0
  let quoteChar = null

  for (; position < sqlDefintions.length; position++) {
    const character = sqlDefintions[position]

    if (quoteChar !== null) {
      if (character !== quoteChar) {
        continue
      }

      // SQL escapes quotes by doubling them (sigh), so we need this for cases like:
      // 'O''Brien'
      if (sqlDefintions[position + 1] === quoteChar) {
        position++
      } else {
        quoteChar = null
      }
      continue
    }

    if (['"', "'", '`', '['].includes(character)) {
      quoteChar = character === '[' ? ']' : character
    } else if (character === '(') {
      depth++
    } else if (character === ')') {
      depth--
    } else if (character === ',' && depth === 0) {
      rawDefinitions.push(sqlDefintions.slice(currentDefinitionStart, position))
      currentDefinitionStart = position + 1
    }
  }
  rawDefinitions.push(sqlDefintions.slice(currentDefinitionStart))
  return rawDefinitions
}

module.exports = { repairSQLiteUsers }
