/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import * as Flowchart from '../flowchart/flowchart'
import { FlowchartMarkdownExtension } from './flowchart-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('../flowchart/flowchart')

describe('Flowchart markdown extensions', () => {
  beforeAll(async () => {
    jest.spyOn(Flowchart, 'FlowChart').mockImplementation((({ code }) => {
      return (
        <span>
          this is a mock for flowchart frame
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

  it('renders a flowchart codeblock', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new FlowchartMarkdownExtension()]}
        content={'```flow\nst=>start: Start\ne=>end: End\nst->e\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
