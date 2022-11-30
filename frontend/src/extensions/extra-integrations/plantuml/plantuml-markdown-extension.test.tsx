/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../components/markdown-renderer/test-utils/mock-i18n'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import * as reduxModule from '../../../redux'
import type { ApplicationState } from '../../../redux/application-state'
import { PlantumlMarkdownExtension } from './plantuml-markdown-extension'
import { render } from '@testing-library/react'
import React from 'react'
import { Mock } from 'ts-mockery'

jest.mock('../../../redux')

describe('PlantUML markdown extensions', () => {
  beforeAll(() => mockI18n())

  it('renders a plantuml codeblock', () => {
    jest.spyOn(reduxModule, 'getGlobalState').mockReturnValue(
      Mock.of<ApplicationState>({
        config: {
          plantumlServer: 'https://example.org'
        }
      })
    )

    const view = render(
      <TestMarkdownRenderer
        extensions={[new PlantumlMarkdownExtension()]}
        content={'```plantuml\nclass Example\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })

  it('renders an error if no server is defined', () => {
    jest.spyOn(reduxModule, 'getGlobalState').mockReturnValue(
      Mock.of<ApplicationState>({
        config: {
          plantumlServer: undefined
        }
      })
    )

    const view = render(
      <TestMarkdownRenderer
        extensions={[new PlantumlMarkdownExtension()]}
        content={'```plantuml\nclass Example\n```'}
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
