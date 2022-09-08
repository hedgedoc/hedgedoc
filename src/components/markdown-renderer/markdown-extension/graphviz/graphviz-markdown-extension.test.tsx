/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import React from 'react'
import { mockI18n } from '../../test-utils/mock-i18n'
import { GraphvizMarkdownExtension } from './graphviz-markdown-extension'
import * as GraphvizFrameModule from '../graphviz/graphviz-frame'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'

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
