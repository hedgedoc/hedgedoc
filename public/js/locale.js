const $locale = $('select.ui-locale')
const supportedLangs = []

const userLang = navigator.language || navigator.userLanguage
const userLangCode = userLang.split('-')[0]
const cookieLang = Cookies.get('locale')
var lang = 'en'

$locale.find('option').each(function () {
  supportedLangs.push($(this).val())
})

if (cookieLang && supportedLangs.indexOf(cookieLang) !== -1) {
  lang = cookieLang
  if (lang === 'zh') {
    lang = 'zh-TW'
  }
} else if (supportedLangs.indexOf(userLang) !== -1) {
  lang = userLang
} else if (supportedLangs.indexOf(userLangCode) !== -1) {
  lang = userLangCode
}

$locale.val(lang)
$locale.find('option[value="' + lang + '"]').attr('selected', 'selected')

$locale.change(function () {
  Cookies.set('locale', $(this).val(), {
    expires: 5 * 365
  })
  window.location.reload()
})
