/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { PlantumlMarkdownExtension } from './plantuml-markdown-extension'
import { render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import React from 'react'

jest.mock('../../../components/common/application-error-alert/translated-application-error-alert', () => ({
  TranslatedApplicationErrorAlert: (props: PropsWithChildren) =>
    `This is a mock for "TranslatedApplicationErrorAlert". Props: ${JSON.stringify(props)}`
}))

describe('PlantUML markdown extensions', () => {
  beforeAll(async () => {
    await mockI18n()
  })

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
        extensions={[new PlantumlMarkdownExtension(null)]}
        content={'```plantuml\nclass Example\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
