import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import frontmatter from 'markdown-it-front-matter'
import { RawYAMLMetadata } from '../../editor/yaml-metadata/yaml-metadata'

interface FrontmatterPluginOptions {
  onYamlError: (error: boolean) => void,
  onRawMeta: (rawMeta: RawYAMLMetadata) => void,
}

export const frontmatterExtract: MarkdownIt.PluginWithOptions<FrontmatterPluginOptions> = (markdownIt: MarkdownIt, options) => {
  if (!options) {
    return
  }
  frontmatter(markdownIt, (rawMeta: string) => {
    try {
      const meta: RawYAMLMetadata = yaml.safeLoad(rawMeta) as RawYAMLMetadata
      options.onYamlError(false)
      options.onRawMeta(meta)
    } catch (e) {
      console.error(e)
      options.onYamlError(true)
      options.onRawMeta({} as RawYAMLMetadata)
    }
  })
}
