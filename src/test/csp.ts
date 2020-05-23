/* eslint-env node, mocha */
'use strict'

import assert from 'assert'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import * as configModule from '../lib/config'
import { ImportMock } from 'ts-mock-imports'

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
      useCDN: true
    }
  })

  // beginnging Tests
  it('Disable CDN', function () {
    const testconfig = defaultConfig
    testconfig.useCDN = false
    ImportMock.mockOther(configModule, 'config', testconfig)

    assert(!csp.computeDirectives().scriptSrc.includes('https://cdnjs.cloudflare.com'))
    assert(!csp.computeDirectives().scriptSrc.includes('https://cdn.mathjax.org'))
    assert(!csp.computeDirectives().styleSrc.includes('https://cdnjs.cloudflare.com'))
    assert(!csp.computeDirectives().styleSrc.includes('https://fonts.googleapis.com'))
    assert(!csp.computeDirectives().fontSrc.includes('https://cdnjs.cloudflare.com'))
    assert(!csp.computeDirectives().fontSrc.includes('https://fonts.gstatic.com'))
  })

  it('Disable Google Analytics', function () {
    const testconfig = defaultConfig
    testconfig.csp.addGoogleAnalytics = false
    ImportMock.mockOther(configModule, 'config', testconfig)

    assert(!csp.computeDirectives().scriptSrc.includes('https://www.google-analytics.com'))
  })

  it('Disable Disqus', function () {
    const testconfig = defaultConfig
    testconfig.csp.addDisqus = false
    ImportMock.mockOther(configModule, 'config', testconfig)

    assert(!csp.computeDirectives().scriptSrc.includes('https://disqus.com'))
    assert(!csp.computeDirectives().scriptSrc.includes('https://*.disqus.com'))
    assert(!csp.computeDirectives().scriptSrc.includes('https://*.disquscdn.com'))
    assert(!csp.computeDirectives().styleSrc.includes('https://*.disquscdn.com'))
    assert(!csp.computeDirectives().fontSrc.includes('https://*.disquscdn.com'))
  })

  it('Set ReportURI', function () {
    const testconfig = defaultConfig
    testconfig.csp.reportURI = 'https://example.com/reportURI'
    ImportMock.mockOther(configModule, 'config', testconfig)

    assert.strictEqual(csp.computeDirectives().reportUri, 'https://example.com/reportURI')
  })

  it('Set own directives', function () {
    const testconfig = defaultConfig
    ImportMock.mockOther(configModule, 'config', testconfig)
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
    ImportMock.mockOther(configModule, 'config', testconfig)

    const variations = ['default', 'script', 'img', 'style', 'font', 'object', 'media', 'child', 'connect']

    for (let i = 0; i < variations.length; i++) {
      assert.strictEqual(csp.computeDirectives()[variations[i] + 'Src'].toString(), ['https://' + variations[i] + '.example.com'].concat(unextendedCSP[variations[i] + 'Src']).toString())
    }
  })

  /*
   * This test reminds us to update the CSP hash for the speaker notes
   */
  it('Unchanged hash for reveal.js speaker notes plugin', function () {
    const hash = crypto.createHash('sha1')
    hash.update(fs.readFileSync(path.join(process.cwd(), '/node_modules/reveal.js/plugin/notes/notes.html'), 'utf8'), 'utf8')
    assert.strictEqual(hash.digest('hex'), 'd5d872ae49b5db27f638b152e6e528837204d380')
  })
})
