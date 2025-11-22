import $ from 'jquery'
import Cookies from 'js-cookie'
const supportedLanguages = require('../../locales/_supported.json')

function detectLang () {
  if (Cookies.get('locale')) {
    let lang = Cookies.get('locale')
    if (lang === 'zh') {
      lang = 'zh-TW'
    }
    return lang
  }
  const userLang = navigator.language || navigator.userLanguage
  const userLangCode = userLang.split('-')[0]
  const supportedLanguagesList = Object.keys(supportedLanguages)
  if (supportedLanguagesList.includes(userLangCode)) {
    return userLangCode
  } else if (supportedLanguagesList.includes(userLang)) {
    return userLang
  }
  return 'en'
}

const lang = detectLang()
const localeSelector = $('.ui-locale')
Object.entries(supportedLanguages).forEach(function ([isoCode, nativeName]) {
  localeSelector.append(`<option value="${isoCode}">${nativeName}</option>`)
})

// the following condition is needed as the selector is only available in the intro/history page
if (localeSelector.length > 0) {
  localeSelector.val(lang)
  $('select.ui-locale option[value="' + lang + '"]').attr('selected', 'selected')
  localeSelector.change(function () {
    Cookies.set('locale', $(this).val(), {
      expires: 365,
      sameSite: window.cookiePolicy,
      secure: window.location.protocol === 'https:'
    })
    window.location.reload()
  })
}

window.moment.locale(lang)
