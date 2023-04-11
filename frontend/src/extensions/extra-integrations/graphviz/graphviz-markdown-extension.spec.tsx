/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import * as GraphvizFrameModule from '../graphviz/graphviz-frame'
import { GraphvizMarkdownExtension } from './graphviz-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('../graphviz/graphviz-frame')

describe('PlantUML markdown extensions', () => {
  beforeAll(async () => {
    jest.spyOn(GraphvizFrameModule, 'GraphvizFrame').mockImplementation((({ code }) => {
      return (
        <span>
          this is a mock for graphviz frame
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

  it('renders a plantuml codeblock', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new GraphvizMarkdownExtension()]}
        content={'```graphviz\ngraph {\na -- b\n}\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
