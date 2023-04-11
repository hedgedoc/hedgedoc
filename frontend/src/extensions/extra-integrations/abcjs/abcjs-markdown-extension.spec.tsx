/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import * as AbcFrameModule from './abc-frame'
import { AbcjsMarkdownExtension } from './abcjs-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('./abc-frame')

describe('AbcJs Markdown Extension', () => {
  beforeAll(async () => {
    jest.spyOn(AbcFrameModule, 'AbcFrame').mockImplementation((({ code }) => {
      return (
        <span>
          this is a mock for abc js frame
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

  it('renders an abc codeblock', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new AbcjsMarkdownExtension()]}
        content={
          '```abc\nX:1\\nT:Speed the Plough\\nM:4/4\\nC:Trad.\\nK:G\\n|:GABc dedB|dedB dedB|c2ec B2dB|c2A2 A2BA|\\nGABc dedB|dedB dedB|c2ec B2dB|A2F2 G4:|\\n|:g2gf gdBd|g2f2 e2d2|c2ec B2dB|c2A2 A2df|\\ng2gf g2Bd|g2f2 e2d2|c2ec B2dB|A2F2 G4:|\n```'
        }
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
