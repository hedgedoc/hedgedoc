import MarkdownIt from 'markdown-it'
import { TocAst } from '../../../external-types/markdown-it-toc-done-right/interface'
import { RawYAMLMetadata } from '../../editor/yaml-metadata/yaml-metadata'
import { alertContainer } from '../markdown-it-plugins/alert-container'
import { documentToc } from '../markdown-it-plugins/document-toc'
import { frontmatterExtract } from '../markdown-it-plugins/frontmatter'
import { headlineAnchors } from '../markdown-it-plugins/headline-anchors'
import { highlightedCode } from '../markdown-it-plugins/highlighted-code'
import { plantumlWithError } from '../markdown-it-plugins/plantuml'
import { quoteExtra } from '../markdown-it-plugins/quote-extra'
import { tasksLists } from '../markdown-it-plugins/tasks-lists'
import { legacySlideshareShortCode } from '../regex-plugins/replace-legacy-slideshare-short-code'
import { legacySpeakerdeckShortCode } from '../regex-plugins/replace-legacy-speakerdeck-short-code'
import { AsciinemaReplacer } from '../replace-components/asciinema/asciinema-replacer'
import { GistReplacer } from '../replace-components/gist/gist-replacer'
import { KatexReplacer } from '../replace-components/katex/katex-replacer'
import { LineMarkers, lineNumberMarker } from '../replace-components/linemarker/line-number-marker'
import { PdfReplacer } from '../replace-components/pdf/pdf-replacer'
import { VimeoReplacer } from '../replace-components/vimeo/vimeo-replacer'
import { YoutubeReplacer } from '../replace-components/youtube/youtube-replacer'
import { BasicMarkdownItConfigurator } from './BasicMarkdownItConfigurator'

export class FullMarkdownItConfigurator extends BasicMarkdownItConfigurator {
  constructor (
    private useFrontmatter: boolean,
    private onYamlError: (error: boolean) => void,
    private onRawMeta: (rawMeta: RawYAMLMetadata) => void,
    private onToc: (toc: TocAst) => void,
    private onLineMarkers: (lineMarkers: LineMarkers[]) => void
  ) {
    super()
  }

  protected configure (markdownIt: MarkdownIt): void {
    super.configure(markdownIt)

    this.configurations.push(
      plantumlWithError,
      tasksLists,
      (markdownIt) => {
        frontmatterExtract(markdownIt,
          !this.useFrontmatter ? undefined : {
            onYamlError: (error: boolean) => this.onYamlError(error),
            onRawMeta: (rawMeta: RawYAMLMetadata) => this.onRawMeta(rawMeta)
          })
      },
      headlineAnchors,
      KatexReplacer.markdownItPlugin,
      YoutubeReplacer.markdownItPlugin,
      VimeoReplacer.markdownItPlugin,
      GistReplacer.markdownItPlugin,
      legacySlideshareShortCode,
      legacySpeakerdeckShortCode,
      PdfReplacer.markdownItPlugin,
      AsciinemaReplacer.markdownItPlugin,
      highlightedCode,
      quoteExtra,
      (markdownIt) => documentToc(markdownIt, this.onToc),
      alertContainer,
      (markdownIt) => lineNumberMarker(markdownIt, (lineMarkers) => this.onLineMarkers(lineMarkers))
    )
  }
}
