export function escapeHtml (string) {
  let element = document.createElement('div')
  let stringElement = document.createTextNode(string)
  element.appendChild(stringElement)
  return element.innerHTML
}

export function addLineNumbers (escapedCode, lang, startnumber) {
  const lines = escapedCode.split('\n')
  const linenumbers = []
  for (let i = 0; i < lines.length - 1; i++) {
    linenumbers[i] = `<span data-linenumber='${startnumber + i}'></span>`
  }
  const continuelinenumber = /=\+$/.test(lang)
  const linegutter = `<div class='gutter linenumber${continuelinenumber ? ' continue' : ''}'>${linenumbers.join('\n')}</div>`
  return `<div class='wrapper'>${linegutter}<div class='code'>${escapedCode}</div></div>`
}
