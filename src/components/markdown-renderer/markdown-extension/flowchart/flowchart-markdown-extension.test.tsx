/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import React from 'react'
import { mockI18n } from '../../test-utils/mock-i18n'
import { FlowchartMarkdownExtension } from './flowchart-markdown-extension'
import * as Flowchart from '../flowchart/flowchart'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'

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
