'use strict';

import {escapeHtml}  from './utils'

let externals = {}

externals.checkLang = function (lang) {
  if (typeof lang !== 'string') {
    return false
  }
  const languages = ['sequence', 'flow', 'graphviz', 'mermaid', 'abc']
  return languages.includes(lang.toLowerCase())
}

externals.highlight = function (code, lang) {
  const escapedCode = escapeHtml(code)
  if (lang === 'sequence') {
    return `<div class="sequence-diagram raw">${escapedCode}</div>`
  } else if (lang === 'flow') {
    return `<div class="flow-chart raw">${escapedCode}</div>`
  } else if (lang === 'graphviz') {
    return `<div class="graphviz raw">${escapedCode}</div>`
  } else if (lang === 'mermaid') {
    return `<div class="mermaid raw">${escapedCode}</div>`
  } else if (lang === 'abc') {
    return `<div class="abc raw">${escapedCode}</div>`
  }
}

module.exports = externals
