import { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

export const replaceQuoteExtraAuthor: RegexOptions = {
  name: 'quote-extra-name',
  regex: /\[name=([^\]]+)]/,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<span class="quote-extra"><i class="fa fa-user mx-1"></i> ${match}</span>`
  }
}
