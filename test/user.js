/* eslint-env node, mocha */

'use strict'

const assert = require('assert')

const models = require('../lib/models')
const User = models.User

describe('User Sequelize model', function () {
  beforeEach(() => {
    return models.sequelize.sync({ force: true })
  })

  it('stores a password hash on creation and verifies that password', function () {
    const userData = {
      password: 'test123'
    }
    const intentionallyInvalidPassword = 'stuff'

    return User.create(userData).then(u => {
      assert(u.verifyPassword(userData.password))
      assert(!u.verifyPassword(intentionallyInvalidPassword))
    })
  })

  it('can cope with password stored in standard scrypt header format', function () {
    const testKey = '736372797074000e00000008000000018c7b8c1ac273fd339badde759b3efc418bc61b776debd02dfe95989383cf9980ad21d2403dce33f4b551f5e98ce84edb792aee62600b1303ab8d4e6f0a53b0746e73193dbf557b888efc83a2d6a055a9'
    const validPassword = 'test'
    const intentionallyInvalidPassword = 'stuff'

    const u = User.build()
    u.setDataValue('password', testKey) // this circumvents the setter - which we don't need in this case!
    assert(u.verifyPassword(validPassword))
    assert(!u.verifyPassword(intentionallyInvalidPassword))
  })
})
