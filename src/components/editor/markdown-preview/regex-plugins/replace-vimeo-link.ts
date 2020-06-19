import { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

const protocolRegex = /(?:http(?:s)?:\/\/)?/
const domainRegex = /(?:player\.)?(?:vimeo\.com\/)(?:(?:channels|album|ondemand|groups)\/\w+\/)?(?:video\/)?/
const idRegex = /([\d]{6,11})/
const tailRegex = /(?:[?#].*)?/
const vimeoVideoUrlRegex = new RegExp(`(?:${protocolRegex.source}${domainRegex.source}${idRegex.source}${tailRegex.source})`)
const linkRegex = new RegExp(`^${vimeoVideoUrlRegex.source}$`, 'i')

export const replaceVimeoLink: RegexOptions = {
  name: 'vimeo-link',
  regex: linkRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<codimd-vimeo id="${match}"></codimd-vimeo>`
  }
}
