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
      return Promise.all([
        u.verifyPassword(userData.password).then(result => assert.strictEqual(result, true)),
        u.verifyPassword(intentionallyInvalidPassword).then(result => assert.strictEqual(result, false))
      ]).catch(e => assert.fail(e))
    })
  })

  it('can cope with password stored in standard scrypt header format', function () {
    const testKey = '736372797074000e00000008000000018c7b8c1ac273fd339badde759b3efc418bc61b776debd02dfe95989383cf9980ad21d2403dce33f4b551f5e98ce84edb792aee62600b1303ab8d4e6f0a53b0746e73193dbf557b888efc83a2d6a055a9'
    const validPassword = 'test'
    const intentionallyInvalidPassword = 'stuff'

    const u = User.build()
    u.setDataValue('password', testKey) // this circumvents the setter - which we don't need in this case!
    return Promise.all([
      u.verifyPassword(validPassword).then(result => assert.strictEqual(result, true)),
      u.verifyPassword(intentionallyInvalidPassword).then(result => assert.strictEqual(result, false))
    ]).catch(e => assert.fail(e))
  })

  it('deals with various characters correctly', function () {
    const combinations = [
      // ['correct password', 'scrypt syle hash']
      ['test', '736372797074000e00000008000000018c7b8c1ac273fd339badde759b3efc418bc61b776debd02dfe95989383cf9980ad21d2403dce33f4b551f5e98ce84edb792aee62600b1303ab8d4e6f0a53b0746e73193dbf557b888efc83a2d6a055a9'],
      ['ohai', '736372797074000e00000008000000010efec4e5ce6a5294491f1b1cccc38d3562f84844b9271aef635f8bc338cf4e0e0bac62ebb11379e85894c1f694e038fc39b087b4fdacd1280b50a7382d7ffbfc82f2190bef70d47708d2a94b75126294'],
      ['my secret pw', '736372797074000f0000000800000001ffb4cd10a1dfe9e64c1e5416fd6d55b390b6822e78b46fd1f963fe9f317a1e05f9c5fee15e1f618286f4e38b55364ae1e7dc295c9dc33ee0f5712e86afe37e5784ff9c7cf84cf0e631dd11f84f3621e7'],
      ['my secret pw', /* different hash! */ '736372797074000f0000000800000001f6083e9593365acd07550f7c72f19973fb7d52c3ef0a78026ff66c48ab14493843c642167b5e6b7f31927e8eeb912bc2639e41955fae15da5099998948cfeacd022f705624931c3b30104e6bb296b805'],
      ['i am so extremely long, it\'s not even funny. Wait, you\'re still reading?', '736372797074000f00000008000000012d205f7bb529bb3a8b8bb25f5ab46197c7e9baf1aad64cf5e7b2584c84748cacf5e60631d58d21cb51fa34ea93b517e2fe2eb722931db5a70ff5a1330d821288ee7380c4136369f064b71b191a785a5b']
    ]
    const intentionallyInvalidPassword = 'stuff'

    return Promise.all(combinations.map((combination, index) => {
      const u = User.build()
      u.setDataValue('password', combination[1])
      return Promise.all([
        u.verifyPassword(combination[0])
          .then(result => assert.strictEqual(result, true, `password #${index} "${combination[0]}" should have been verified`)),
        u.verifyPassword(intentionallyInvalidPassword)
          .then(result => assert.strictEqual(result, false, `password #${index} "${combination[0]}" should NOT have been verified`))
      ])
    })).catch(e => assert.fail(e))
  })
})
