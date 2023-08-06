/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CodeProps } from '../../../components/markdown-renderer/replace-components/code-block-component-replacer'
import { TestMarkdownRenderer } from '../../../components/markdown-renderer/test-utils/test-markdown-renderer'
import { mockI18n } from '../../../test-utils/mock-i18n'
import * as VegaLiteChartModule from '../vega-lite/vega-lite-chart'
import { VegaLiteMarkdownExtension } from './vega-lite-markdown-extension'
import { render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import React from 'react'

jest.mock('../vega-lite/vega-lite-chart')
jest.mock('../../../components/common/application-error-alert/application-error-alert', () => ({
  ApplicationErrorAlert: ({ children, ...props }: PropsWithChildren) => (
    <div>
      <h3>This is a mock for ApplicationErrorAlert.</h3>
      Props: <code>{JSON.stringify(props)}</code>
      Children:
      <div>{children}</div>
    </div>
  )
}))

describe('Vega-Lite markdown extensions', () => {
  beforeAll(async () => {
    jest.spyOn(VegaLiteChartModule, 'VegaLiteChart').mockImplementation((({ code }) => {
      return (
        <span>
          this is a mock for vega lite
          <code>{code}</code>
        </span>
      )
    }) as React.FC<CodeProps>)
    await mockI18n()
  })

  it('renders a vega-lite codeblock', () => {
    const view = render(
      <TestMarkdownRenderer
        extensions={[new VegaLiteMarkdownExtension()]}
        content={
          '```vega-lite\n{"$schema":"https://vega.github.io/schema/vega-lite/v4.json","data":{"values":[{"a":"","b":28}]},"mark":"bar","encoding":{"x":{"field":"a"},"y":{"field":"b"}}}\n```'
        }
      />
    )
    expect(view.container).toMatchSnapshot()
  })
})
