/* eslint-env browser, jquery */
/* global moment, serverurl */

/**
 * WHY
 * ---
 * This extends the Prism.js module to provide some useful and needed functions
 * for better integration with CodiMD.
 * It also allows central provisioning of additional languages.
 */

require('prismjs/themes/prism.css')
require('prismjs/components/prism-wiki')
require('prismjs/components/prism-haskell')
require('prismjs/components/prism-go')
require('prismjs/components/prism-rust')
require('prismjs/components/prism-typescript')
require('prismjs/components/prism-jsx')
require('prismjs/components/prism-makefile')
require('prismjs/components/prism-gherkin')

import Prism from 'prismjs'

const languages = ['haskell', 'go', 'rust', 'typescript', 'typescript', 'js', 'jsx', 'gherkin', 'tiddlywiki', 'mediawiki', 'wiki', 'cmake']

Prism.listLanguages = function () {
  return languages
}

Prism.checkLang = function (lang) {
  if (typeof lang !== 'string') {
    return false
  }
  return languages.includes(lang.toLowerCase())
}

Prism.selectLang = function (lang) {
  if (typeof lang !== 'string') {
    return undefined
  }

  switch (lang.toLowerCase()) {
    case "mediawiki":
    case "tiddlywiki":
      return Prism.languages.wiki
    case "cmake":
      return Prism.languages.makefile
    default:
      return Prism.languages[lang.toLowerCase()]
  }
}

module.exports = Prism
