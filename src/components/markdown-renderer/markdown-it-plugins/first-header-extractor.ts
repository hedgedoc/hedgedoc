import MarkdownIt from 'markdown-it/lib'

export interface FirstHeaderExtractorOptions {
  firstHeaderFound: (firstHeader: string|undefined) => void
}

export const firstHeaderExtractor: () => MarkdownIt.PluginWithOptions<FirstHeaderExtractorOptions> = () => {
  return (md, options) => {
    if (!options?.firstHeaderFound) {
      return
    }
    md.core.ruler.after('normalize', 'extract first L1 heading', (state) => {
      const lines = state.src.split('\n')
      const linkAltTextRegex = /!?\[([^\]]*)]\([^)]*\)/
      for (const line of lines) {
        if (line.startsWith('# ')) {
          const headerLine = line.replace('# ', '').replace(linkAltTextRegex, '$1')
          options.firstHeaderFound(headerLine)
          return true
        }
      }
      options.firstHeaderFound(undefined)
      return true
    })
  }
}
