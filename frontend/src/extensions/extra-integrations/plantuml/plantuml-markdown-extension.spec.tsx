/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { PlantumlMarkdownExtension } from './plantuml-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'

describe('PlantUML markdown extensions', () => {
  beforeAll(() => mockI18n())

  it('renders a plantuml codeblock', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new PlantumlMarkdownExtension('https://example.org')]}
        content={'```plantuml\nclass Example\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })

  it('renders an error if no server is defined', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new PlantumlMarkdownExtension(undefined)]}
        content={'```plantuml\nclass Example\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
