'use strict'

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')

const configDir = path.resolve(__dirname, '..', 'lib', 'config')

// The config modules read the environment when they are loaded, so load them
// again for each case with only the given CMD_* and legacy variables set.
function loadConfig (env) {
  const savedEnv = process.env
  process.env = {
    ...Object.fromEntries(Object.entries(savedEnv).filter(([key]) => !key.startsWith('CMD_') && !key.startsWith('HMD_') && key !== 'DATABASE_URL')),
    NODE_ENV: 'test',
    ...env
  }
  const dropConfigModules = () => Object.keys(require.cache)
    .filter((file) => file.startsWith(configDir + path.sep))
    .forEach((file) => delete require.cache[file])
  try {
    dropConfigModules()
    return require(configDir)
  } finally {
    process.env = savedEnv
    // Later tests get the config for the real environment again.
    dropConfigModules()
  }
}

describe('Config', function () {
  let tempDir, emptyConfigFile

  before(function () {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hedgedoc-config-'))
    emptyConfigFile = path.join(tempDir, 'config.json')
    fs.writeFileSync(emptyConfigFile, '{}')
  })

  after(function () {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('starts with DATABASE_URL set and a config file without a section for the environment', function () {
    const { dbURL } = loadConfig({
      CMD_CONFIG_FILE: emptyConfigFile,
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db'
    })
    assert.strictEqual(dbURL, 'postgres://user:pass@localhost:5432/db')
  })

  it('prefers CMD_DB_URL over the legacy DATABASE_URL', function () {
    const { dbURL } = loadConfig({
      CMD_CONFIG_FILE: emptyConfigFile,
      CMD_DB_URL: 'sqlite:///:memory:',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db'
    })
    assert.strictEqual(dbURL, 'sqlite:///:memory:')
  })

  it('still reads a legacy lowercase setting from the config file', function () {
    const legacyConfigFile = path.join(tempDir, 'legacy.json')
    fs.writeFileSync(legacyConfigFile, JSON.stringify({ test: { dburl: 'mysql://user:pass@localhost:3306/db' } }))
    const { dbURL } = loadConfig({ CMD_CONFIG_FILE: legacyConfigFile })
    assert.strictEqual(dbURL, 'mysql://user:pass@localhost:3306/db')
  })
})
