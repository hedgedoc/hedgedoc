import MarkdownIt from 'markdown-it/lib'
import linkify from 'markdown-it/lib/rules_core/linkify'

export const linkifyExtra: MarkdownIt.PluginSimple = (md) => {
  md.core.ruler.push('linkify', state => {
    try {
      state.md.options.linkify = true
      return linkify(state)
    } finally {
      state.md.options.linkify = false
    }
  })
}
