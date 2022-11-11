/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as CsvTableModule from '../csv/csv-table'
import React from 'react'
import { render } from '@testing-library/react'
import { CsvTableMarkdownExtension } from './csv-table-markdown-extension'
import { mockI18n } from '../../../components/markdown-renderer/test-utils/mock-i18n'
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'

jest.mock('../csv/csv-table')

describe('CSV Table Markdown Extension', () => {
  beforeAll(async () => {
    jest.spyOn(CsvTableModule, 'CsvTable').mockImplementation((({ code }) => {
      return (
        <span>
          this is a mock for csv frame
          <code>{code}</code>
        </span>
      )
    }) as React.FC<CodeProps>)
    await mockI18n()
  })

  afterAll(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })

  it('renders a csv codeblock', () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new CsvTableMarkdownExtension()]} content={'```csv\na;b;c\nd;e;f\n```'} />
    )
    expect(view.container).toMatchSnapshot()
  })
})
