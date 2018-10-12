'use strict';

import hljs  from 'highlight.js'

hljs.checkLang = function (lang) {
  if (typeof lang !== 'string') {
    return false
  }
  const languages = hljs.listLanguages()
  return languages.includes(lang.toLowerCase())
}

module.exports = hljs
