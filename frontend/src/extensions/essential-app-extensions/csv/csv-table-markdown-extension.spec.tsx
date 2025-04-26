/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import * as CsvTableModule from '../csv/csv-table'
import { CsvTableMarkdownExtension } from './csv-table-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vitest, beforeAll, afterAll } from 'vitest'
import { vi } from 'vitest'

vi.mock('../csv/csv-table')

describe('CSV Table Markdown Extension', () => {
  beforeAll(async () => {
    vitest.spyOn(CsvTableModule, 'CsvTable').mockImplementation((({ code }) => {
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
    vitest.resetModules()
    vitest.restoreAllMocks()
  })

  it('renders a csv codeblock', () => {
    const view = render(
      <TestMarkdownRenderer extensions={[new CsvTableMarkdownExtension()]} content={'```csv\na;b;c\nd;e;f\n```'} />
    )
    expect(view.container).toMatchSnapshot()
  })
})
