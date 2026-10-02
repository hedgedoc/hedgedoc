'use strict'

const assert = require('assert')
const express = require('express')
const session = require('express-session')
const { Passport } = require('passport')
const mock = require('mock-require')

describe('Login return destination', function () {
  const serverURL = 'https://hedgedoc.example/hedgedoc'
  const noteURL = serverURL + '/some-note?both'
  let server, baseURL

  before(function (done) {
    const passport = new Passport()
    passport.use('test', {
      authenticate: function () { this.success({ id: 'test-user' }) }
    })
    mock('../lib/config', { serverURL })
    mock('../lib/logger', { info: function () {} })
    mock('../lib/models', {})
    mock('passport', passport)
    const authRouter = mock.reRequire('../lib/web/auth')
    mock.stop('../lib/config')
    mock.stop('../lib/logger')
    mock.stop('../lib/models')
    mock.stop('passport')
    delete require.cache[require.resolve('../lib/web/auth')]

    // Exercise the shared router with real Passport authentication and sessions.
    const authenticate = passport.authenticate('test', {
      successReturnToOrRedirect: serverURL + '/'
    })
    authRouter.post('/login', authenticate)
    authRouter.post('/auth/ldap', authenticate)
    authRouter.get('/auth/oauth2', function (req, res) {
      res.redirect('https://provider.example/login')
    })
    authRouter.get('/auth/oauth2/callback', authenticate)

    const app = express()
    app.use(session({ secret: 'test-secret', resave: false, saveUninitialized: false }))
    app.use(passport.initialize())
    app.get('/seed-return-to', function (req, res) {
      req.session.returnTo = noteURL
      res.end()
    })
    app.use(authRouter)
    server = app.listen(0, '127.0.0.1', function () {
      baseURL = 'http://127.0.0.1:' + server.address().port
      done()
    })
  })

  after(function (done) {
    server.close(done)
  })

  function request (path, method, referer, cookie) {
    const headers = {}
    if (referer) headers.Referer = referer
    if (cookie) headers.Cookie = cookie
    return fetch(baseURL + path, { method, headers, redirect: 'manual' })
  }

  for (const path of ['/login', '/auth/ldap']) {
    it('returns to the note after form login at ' + path, async function () {
      const response = await request(path, 'POST', noteURL)
      assert.strictEqual(response.status, 302)
      assert.strictEqual(response.headers.get('location'), noteURL)
    })
  }

  it('preserves the note through an external provider callback and session regeneration', async function () {
    const start = await request('/auth/oauth2', 'GET', noteURL)
    const cookie = start.headers.get('set-cookie').split(';')[0]
    const callback = await request('/auth/oauth2/callback', 'GET', 'https://provider.example/', cookie)
    assert.strictEqual(callback.headers.get('location'), noteURL)
    assert.notStrictEqual(callback.headers.get('set-cookie').split(';')[0], cookie)
  })

  it('does not overwrite the destination on a same-origin callback', async function () {
    const start = await request('/auth/oauth2', 'GET', noteURL)
    const cookie = start.headers.get('set-cookie').split(';')[0]
    const callback = await request('/auth/oauth2/callback', 'GET', serverURL + '/auth/oauth2', cookie)
    assert.strictEqual(callback.headers.get('location'), noteURL)
  })

  it('preserves a forbidden-note destination when login starts from the landing page', async function () {
    const seed = await request('/seed-return-to', 'GET')
    const cookie = seed.headers.get('set-cookie').split(';')[0]
    const response = await request('/login', 'POST', serverURL + '/?message=login', cookie)
    assert.strictEqual(response.headers.get('location'), noteURL)
  })

  for (const referer of [undefined, serverURL + '/', 'https://other.example/note', 'https://hedgedoc.example/hedgedoc-other/note']) {
    it('uses the default destination for referrer ' + referer, async function () {
      const response = await request('/login', 'POST', referer)
      assert.strictEqual(response.headers.get('location'), serverURL + '/')
    })
  }
})
