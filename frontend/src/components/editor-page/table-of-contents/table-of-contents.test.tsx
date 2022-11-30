/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
import { TableOfContents } from './table-of-contents'
import { render } from '@testing-library/react'
import type { TocAst } from 'markdown-it-toc-done-right'

describe('Table of contents', () => {
  beforeAll(async () => {
    await mockI18n()
  })

  const level4Ast: TocAst = {
    n: 'Level 4',
    l: 4,
    c: []
  }
  const level3Ast: TocAst = {
    n: 'Level 3',
    l: 3,
    c: [level4Ast]
  }
  const level2Ast: TocAst = {
    n: 'Level 2',
    l: 2,
    c: [level3Ast]
  }
  const level1Ast: TocAst = {
    n: 'Level 1',
    l: 1,
    c: [level2Ast]
  }
  const level0Ast: TocAst = {
    n: '',
    l: 0,
    c: [level1Ast]
  }

  it('renders correctly', () => {
    const view = render(
      <TableOfContents ast={level0Ast} className={'customClassName'} baseUrl={'https://example.org'} />
    )
    expect(view.container).toMatchSnapshot()
  })

  it('renders only in requested max depth', () => {
    const view = render(
      <TableOfContents ast={level0Ast} maxDepth={2} className={'customClassName'} baseUrl={'https://example.org'} />
    )
    expect(view.container).toMatchSnapshot()
  })
})
