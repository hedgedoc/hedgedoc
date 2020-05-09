/* eslint-env node, mocha */

'use strict'

import { ImportMock } from 'ts-mock-imports'
import * as configModule from '../lib/config'

const assert = require('assert')
const avatars = require('../lib/letter-avatars')

describe('generateAvatarURL() gravatar enabled', function () {
  beforeEach(function () {
    // Reset config to make sure we don't influence other tests
    let testconfig = {
      allowGravatar: true,
      serverURL: 'http://localhost:3000',
      port: 3000
    }
    ImportMock.mockOther(configModule, 'config', testconfig);
  })

  it('should return correct urls', function () {
    assert.strictEqual(avatars.generateAvatarURL('Daan Sprenkels', 'hello@dsprenkels.com', true), 'https://cdn.libravatar.org/avatar/d41b5f3508cc3f31865566a47dd0336b?s=400')
    assert.strictEqual(avatars.generateAvatarURL('Daan Sprenkels', 'hello@dsprenkels.com', false), 'https://cdn.libravatar.org/avatar/d41b5f3508cc3f31865566a47dd0336b?s=96')
  })

  it('should return correct urls for names with spaces', function () {
    assert.strictEqual(avatars.generateAvatarURL('Daan Sprenkels'), 'http://localhost:3000/user/Daan%20Sprenkels/avatar.svg')
  })
})

describe('generateAvatarURL() gravatar disabled', function () {
  beforeEach(function () {
    // Reset config to make sure we don't influence other tests
    let testconfig = {
      allowGravatar: false,
      serverURL: 'http://localhost:3000',
      port: 3000
    }
    ImportMock.mockOther(configModule, 'config', testconfig);
  })

  it('should return correct urls', function () {
    assert.strictEqual(avatars.generateAvatarURL('Daan Sprenkels', 'hello@dsprenkels.com', true), 'http://localhost:3000/user/Daan%20Sprenkels/avatar.svg')
    assert.strictEqual(avatars.generateAvatarURL('Daan Sprenkels', 'hello@dsprenkels.com', false), 'http://localhost:3000/user/Daan%20Sprenkels/avatar.svg')
  })

  it('should return correct urls for names with spaces', function () {
    assert.strictEqual(avatars.generateAvatarURL('Daan Sprenkels'), 'http://localhost:3000/user/Daan%20Sprenkels/avatar.svg')
  })
})
