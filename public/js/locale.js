/* eslint-env browser, jquery */
/* global Cookies */

const supported = ['en', 'zh-CN', 'zh-TW', 'fr', 'de', 'ja', 'es', 'ca', 'el', 'pt', 'it', 'tr', 'ru', 'nl', 'hr', 'pl', 'uk', 'hi', 'sv', 'eo', 'da', 'ko', 'id', 'sr', 'vi', 'ar', 'cs', 'sk']

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
  if (supported.includes(userLangCode)) {
    return userLangCode
  } else if (supported.includes(userLang)) {
    return userLang
  }
  return 'en'
}

const lang = detectLang()
const localeSelector = $('.ui-locale')

// the following condition is needed as the selector is only available in the intro/history page
if (localeSelector.length > 0) {
  localeSelector.val(lang)
  $('select.ui-locale option[value="' + lang + '"]').attr('selected', 'selected')
  localeSelector.change(function () {
    Cookies.set('locale', $(this).val(), {
      expires: 365,
      sameSite: window.cookiePolicy
    })
    window.location.reload()
  })
}

window.moment.locale(lang)
