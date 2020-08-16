import { RegexOptions } from '../../../external-types/markdown-it-regex/interface'

const protocolRegex = /(?:http(?:s)?:\/\/)?/
const domainRegex = /(?:asciinema\.org\/a\/)/
const idRegex = /(\d+)/
const tailRegex = /(?:[./?#].*)?/
const gistUrlRegex = new RegExp(`(?:${protocolRegex.source}${domainRegex.source}${idRegex.source}${tailRegex.source})`)
const linkRegex = new RegExp(`^${gistUrlRegex.source}$`, 'i')

export const replaceAsciinemaLink: RegexOptions = {
  name: 'asciinema-link',
  regex: linkRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<codimd-asciinema id="${match}"></codimd-asciinema>`
  }
}
