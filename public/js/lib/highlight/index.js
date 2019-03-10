'use strict';

import hljs  from './hljs'
import Prism from './prism'
import externals from './externals'
import {escapeHtml, addLineNumbers} from './utils'

exports.listLanguages = function () {
  return [].concat(hljs.listLanguages()).concat(Prism.listLanguages())
}

exports.render = function (code, lang) {
  if (!lang || /no(-?)highlight|plain|text/.test(lang)) {
    return
  }

  const langMatch = /([^=]+)(=((\d+)|\+)?)?$/.exec(lang)
  const language = langMatch !== null && langMatch[1] ? langMatch[1] : ''
  const startnumber = parseInt(langMatch !== null && langMatch[2] ? langMatch[4] || 1 : -1)

  if (externals.checkLang(language)) {
    return externals.highlight(code, language)
  }

  const escapedCode = highlight(code, language)
  if (startnumber !== -1) {
    return `<pre class="part"><code>${addLineNumbers(escapedCode, lang, startnumber)}</code></pre>`
  }
  return `<pre class="part"><code>${escapedCode}</code></pre>`
}


function highlight (code, lang) {
  if (Prism.checkLang(lang)) {
    return Prism.highlight(code, Prism.selectLang(lang))
  }

  if (hljs.checkLang(lang)) {
    return hljs.highlight(lang, code).value
  }

  return escapeHtml(code)
}
