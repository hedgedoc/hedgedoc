'use strict';

import S     from 'string'
import hljs  from './hljs'
import Prism from './prism'

exports.listLanguages = function () {
  return [].concat(hljs.listLanguages()).concat(Prism.listLanguages())
}

exports.render = function (code, lang) {
  if (typeof code !== 'string' || typeof lang !== 'string') {
    return code
  }
  if (Prism.checkLang(lang)) {
    code = S(code).unescapeHTML().s
    return Prism.highlight(code, Prism.selectLang(lang))
  }

  if (hljs.checkLang(lang)) {
      code = S(code).unescapeHTML().s
      return hljs.highlight(lang, code).value
    } else {
      return code
    }
}
