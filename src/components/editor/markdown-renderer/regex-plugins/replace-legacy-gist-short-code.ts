import { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

const finalRegex = /^{%gist (\w+\/\w+) ?%}$/

export const replaceLegacyGistShortCode: RegexOptions = {
  name: 'legacy-gist-short-code',
  regex: finalRegex,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<codimd-gist id="${match}"></codimd-gist>`
  }
}
