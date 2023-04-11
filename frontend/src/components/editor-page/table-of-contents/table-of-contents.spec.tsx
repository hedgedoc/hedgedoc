/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { TableOfContents } from './table-of-contents'
import type { TocAst } from '@hedgedoc/markdown-it-plugins'
import { render } from '@testing-library/react'

describe('Table of contents', () => {
  beforeAll(async () => {
    await mockI18n()
  })

  const level4Ast: TocAst = {
    name: 'Level 4',
    level: 4,
    children: []
  }
  const level3Ast: TocAst = {
    name: 'Level 3',
    level: 3,
    children: [level4Ast]
  }
  const level2Ast: TocAst = {
    name: 'Level 2',
    level: 2,
    children: [level3Ast]
  }
  const level1Ast: TocAst = {
    name: 'Level 1',
    level: 1,
    children: [level2Ast]
  }
  const level0Ast: TocAst = {
    name: '',
    level: 0,
    children: [level1Ast]
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
