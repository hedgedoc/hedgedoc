import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import definitionList from 'markdown-it-deflist'
import footnote from 'markdown-it-footnote'
import imsize from 'markdown-it-imsize'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import { alertContainer } from '../markdown-it-plugins/alert-container'
import { linkifyExtra } from '../markdown-it-plugins/linkify-extra'
import { MarkdownItParserDebugger } from '../markdown-it-plugins/parser-debugger'
import { twitterEmojis } from '../markdown-it-plugins/twitter-emojis'
import { MarkdownItConfigurator } from './MarkdownItConfigurator'

export class BasicMarkdownItConfigurator extends MarkdownItConfigurator {
  protected configure (markdownIt: MarkdownIt): void {
    this.configurations.push(
      twitterEmojis,
      abbreviation,
      definitionList,
      subscript,
      superscript,
      inserted,
      marked,
      footnote,
      imsize,
      alertContainer
    )
    this.postConfigurations.push(
      linkifyExtra,
      MarkdownItParserDebugger
    )
  }
}
