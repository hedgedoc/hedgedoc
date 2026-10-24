'use strict'

const assert = require('assert')
const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

function pick (object, keys) {
  return Object.fromEntries(keys.filter((key) => object[key] !== undefined).map((key) => [key, object[key]]))
}

// The config module reads the environment when it is loaded, so load it in a
// fresh process for each case and print the setting under test.
function loadConfigValue (key, env) {
  const result = spawnSync(process.execPath, ['-e', `process.stdout.write('\\n' + String(require('./lib/config')[${JSON.stringify(key)}]))`], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...pick(process.env, ['PATH', 'SystemRoot', 'NODE_PATH']), NODE_ENV: 'test', ...env },
    encoding: 'utf-8'
  })
  assert.strictEqual(result.status, 0, result.stderr)
  // The logger also writes to stdout, so the value is the last line.
  return result.stdout.split('\n').pop()
}

describe('Config', function () {
  this.timeout(30000)

  let configDir, emptyConfigFile

  before(function () {
    configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hedgedoc-config-'))
    emptyConfigFile = path.join(configDir, 'config.json')
    fs.writeFileSync(emptyConfigFile, '{}')
  })

  after(function () {
    fs.rmSync(configDir, { recursive: true, force: true })
  })

  it('starts with DATABASE_URL set and a config file without a section for the environment', function () {
    const dbURL = loadConfigValue('dbURL', {
      CMD_CONFIG_FILE: emptyConfigFile,
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db'
    })
    assert.strictEqual(dbURL, 'postgres://user:pass@localhost:5432/db')
  })

  it('prefers CMD_DB_URL over the legacy DATABASE_URL', function () {
    const dbURL = loadConfigValue('dbURL', {
      CMD_CONFIG_FILE: emptyConfigFile,
      CMD_DB_URL: 'sqlite:///:memory:',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db'
    })
    assert.strictEqual(dbURL, 'sqlite:///:memory:')
  })

  it('still reads a legacy lowercase setting from the config file', function () {
    const legacyConfigFile = path.join(configDir, 'legacy.json')
    fs.writeFileSync(legacyConfigFile, JSON.stringify({ test: { dburl: 'mysql://user:pass@localhost:3306/db' } }))
    const dbURL = loadConfigValue('dbURL', { CMD_CONFIG_FILE: legacyConfigFile })
    assert.strictEqual(dbURL, 'mysql://user:pass@localhost:3306/db')
  })
})
