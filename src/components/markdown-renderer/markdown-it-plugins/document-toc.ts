import MarkdownIt from 'markdown-it'
import toc from 'markdown-it-toc-done-right'
import { TocAst } from '../../../external-types/markdown-it-toc-done-right/interface'
import { slugify } from '../../editor/table-of-contents/table-of-contents'

export type DocumentTocPluginOptions = (ast: TocAst) => void

export const documentToc:MarkdownIt.PluginWithOptions<DocumentTocPluginOptions> = (markdownIt, onToc) => {
  if (!onToc) {
    return
  }
  toc(markdownIt, {
    placeholder: '(\\[TOC\\]|\\[toc\\])',
    listType: 'ul',
    level: [1, 2, 3],
    callback: (code: string, ast: TocAst): void => {
      onToc(ast)
    },
    slugify: slugify
  })
}
