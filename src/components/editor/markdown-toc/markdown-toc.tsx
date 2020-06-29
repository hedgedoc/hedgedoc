import React, { Fragment, ReactElement, useMemo } from 'react'
import { TocAst } from '../../../external-types/markdown-it-toc-done-right/interface'
import { slugify } from '../../../utils/slugify'
import { ShowIf } from '../../common/show-if/show-if'
import './markdown-toc.scss'

export interface MarkdownTocProps {
  ast: TocAst
  maxDepth?: number
  sticky?: boolean
}

const convertLevel = (toc: TocAst, levelsToShowUnderThis: number, headerCounts: Map<string, number>, wrapInListItem: boolean): ReactElement | null => {
  if (levelsToShowUnderThis < 0) {
    return null
  }

  const rawName = toc.n.trim()
  const nameCount = (headerCounts.get(rawName) ?? 0) + 1
  const slug = `#${slugify(rawName)}${nameCount > 1 ? `-${nameCount}` : ''}`

  headerCounts.set(rawName, nameCount)

  const content = (
    <Fragment>
      <ShowIf condition={toc.l > 0}>
        <a href={slug}>{rawName}</a>
      </ShowIf>
      <ShowIf condition={toc.c.length > 0}>
        <ul>
          {
            toc.c.map(child =>
              (convertLevel(child, levelsToShowUnderThis - 1, headerCounts, true)))
          }
        </ul>
      </ShowIf>
    </Fragment>
  )

  if (wrapInListItem) {
    return (
      <li key={slug}>
        {content}
      </li>
    )
  } else {
    return content
  }
}

export const MarkdownToc: React.FC<MarkdownTocProps> = ({ ast, maxDepth = 3, sticky }) => {
  const tocTree = useMemo(() => convertLevel(ast, maxDepth, new Map<string, number>(), false), [ast, maxDepth])

  return (
    <div className={`markdown-toc ${sticky ? 'sticky' : ''}`}>
      {tocTree}
    </div>
  )
}
