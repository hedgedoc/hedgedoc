/* eslint-env node, mocha */
'use strict'

const assert = require('assert')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const mock = require('mock-require')

describe('Content security policies', function () {
  let defaultConfig, csp

  before(function () {
    csp = require('../lib/csp')
  })

  beforeEach(function () {
    // Reset config to make sure we don't influence other tests
    defaultConfig = {
      csp: {
        enable: true,
        directives: {
        },
        addDefaults: true,
        addDisqus: true,
        addGoogleAnalytics: true,
        upgradeInsecureRequests: 'auto',
        reportURI: undefined
      },
      dropbox: {
        appKey: undefined
      },
      gitlab: {
        baseURL: undefined
      }
    }
  })

  afterEach(function () {
    mock.stop('../lib/config')
    csp = mock.reRequire('../lib/csp')
  })

  after(function () {
    mock.stopAll()
    csp = mock.reRequire('../lib/csp')
  })

  it('Disable Google Analytics', function () {
    const testconfig = defaultConfig
    testconfig.csp.addGoogleAnalytics = false
    mock('../lib/config', testconfig)
    csp = mock.reRequire('../lib/csp')

    assert(!csp.computeDirectives().scriptSrc.includes('https://www.google-analytics.com'))
  })

  it('Enable Google Analytics', function () {
    const testconfig = defaultConfig
    testconfig.csp.addGoogleAnalytics = true
    mock('../lib/config', testconfig)
    csp = mock.reRequire('../lib/csp')

    assert(csp.computeDirectives().scriptSrc.includes('https://www.google-analytics.com'))
  })

  it('Disable Disqus', function () {
    const testconfig = defaultConfig
    testconfig.csp.addDisqus = false
    mock('../lib/config', testconfig)
    csp = mock.reRequire('../lib/csp')

    assert(!csp.computeDirectives().scriptSrc.includes('https://disqus.com'))
    assert(!csp.computeDirectives().scriptSrc.includes('https://*.disqus.com'))
    assert(!csp.computeDirectives().scriptSrc.includes('https://*.disquscdn.com'))
    assert(!csp.computeDirectives().styleSrc.includes('https://*.disquscdn.com'))
    assert(!csp.computeDirectives().fontSrc.includes('https://*.disquscdn.com'))
  })

  it('Enable Disqus', function () {
    const testconfig = defaultConfig
    testconfig.csp.addDisqus = true
    mock('../lib/config', testconfig)
    csp = mock.reRequire('../lib/csp')

    assert(csp.computeDirectives().scriptSrc.includes('https://disqus.com'))
    assert(csp.computeDirectives().scriptSrc.includes('https://*.disqus.com'))
    assert(csp.computeDirectives().scriptSrc.includes('https://*.disquscdn.com'))
    assert(csp.computeDirectives().styleSrc.includes('https://*.disquscdn.com'))
    assert(csp.computeDirectives().fontSrc.includes('https://*.disquscdn.com'))
  })

  it('Include dropbox if configured', function () {
    const testconfig = defaultConfig
    testconfig.dropbox.appKey = 'hedgedoc'
    mock('../lib/config', testconfig)
    csp = mock.reRequire('../lib/csp')

    assert(csp.computeDirectives().scriptSrc.includes('https://www.dropbox.com'))
    assert(csp.computeDirectives().scriptSrc.includes('\'unsafe-inline\''))
  })

  it('Set ReportURI', function () {
    const testconfig = defaultConfig
    testconfig.csp.reportURI = 'https://example.com/reportURI'
    mock('../lib/config', testconfig)
    csp = mock.reRequire('../lib/csp')

    assert.strictEqual(csp.computeDirectives().reportUri, 'https://example.com/reportURI')
  })

  it('Set own directives', function () {
    const testconfig = defaultConfig
    mock('../lib/config', defaultConfig)
    csp = mock.reRequire('../lib/csp')
    const unextendedCSP = csp.computeDirectives()
    testconfig.csp.directives = {
      defaultSrc: ['https://default.example.com'],
      scriptSrc: ['https://script.example.com'],
      imgSrc: ['https://img.example.com'],
      styleSrc: ['https://style.example.com'],
      fontSrc: ['https://font.example.com'],
      objectSrc: ['https://object.example.com'],
      mediaSrc: ['https://media.example.com'],
      childSrc: ['https://child.example.com'],
      connectSrc: ['https://connect.example.com']
    }
    mock('../lib/config', testconfig)
    csp = mock.reRequire('../lib/csp')

    const variations = ['default', 'script', 'img', 'style', 'font', 'object', 'media', 'child', 'connect']

    for (let i = 0; i < variations.length; i++) {
      assert.strictEqual(csp.computeDirectives()[variations[i] + 'Src'].toString(), ['https://' + variations[i] + '.example.com'].concat(unextendedCSP[variations[i] + 'Src']).filter(x => x != null).toString())
    }
  })

  /*
   * This test reminds us to update the CSP hash for the speaker notes
   */
  it('Unchanged hash for reveal.js speaker notes plugin', function () {
    const hash = crypto.createHash('sha1')
    hash.update(fs.readFileSync(path.resolve(__dirname, '../node_modules/reveal.js/plugin/notes/notes.html'), 'utf8'), 'utf8')
    assert.strictEqual(hash.digest('hex'), 'd5d872ae49b5db27f638b152e6e528837204d380')
  })
})
