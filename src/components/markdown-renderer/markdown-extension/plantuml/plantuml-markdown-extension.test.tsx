/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import React from 'react'
import { PlantumlMarkdownExtension } from './plantuml-markdown-extension'
import { mockI18n } from '../../test-utils/mock-i18n'

describe('PlantUML markdown extensions', () => {
  beforeAll(async () => {
    await mockI18n()
  })

  it('renders a plantuml codeblock', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new PlantumlMarkdownExtension('http://example.org')]}
        content={'```plantuml\nclass Example\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })

  it('renders an error if no server is defined', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new PlantumlMarkdownExtension(null)]}
        content={'```plantuml\nclass Example\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
