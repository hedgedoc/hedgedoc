import markdownItRegex from 'markdown-it-regex'
import MarkdownIt from 'markdown-it/lib'
import { RegexOptions } from '../../../external-types/markdown-it-regex/interface'

const finalRegex = /^{%slideshare (\w+\/[\w-]+) ?%}$/

export const legacySlideshareShortCode: MarkdownIt.PluginSimple = (markdownIt) => {
  markdownItRegex(markdownIt, replaceLegacySlideshareShortCode)
}

export const replaceLegacySlideshareShortCode: RegexOptions = {
  name: 'legacy-slideshare-short-code',
  regex: finalRegex,
  replace: (match) => {
    return `<a target="_blank" rel="noopener noreferrer" href="https://www.slideshare.net/${match}">https://www.slideshare.net/${match}</a>`
  }
}
