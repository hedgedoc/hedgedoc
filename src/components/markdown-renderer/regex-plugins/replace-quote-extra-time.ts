import { RegexOptions } from '../../../external-types/markdown-it-regex/interface'

export const replaceQuoteExtraTime: RegexOptions = {
  name: 'quote-extra-time',
  regex: /\[time=([^\]]+)]/,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<span class="quote-extra"><i class="fa fa-clock-o mx-1"></i> ${match}</span>`
  }
}
