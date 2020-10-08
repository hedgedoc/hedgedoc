import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

export const headlineAnchors: MarkdownIt.PluginSimple = (markdownIt) => {
  // noinspection CheckTagEmptyBody
  anchor(markdownIt, {
    permalink: true,
    permalinkBefore: true,
    permalinkClass: 'heading-anchor text-dark',
    permalinkSymbol: '<i class="fa fa-link"></i>'
  })
}
