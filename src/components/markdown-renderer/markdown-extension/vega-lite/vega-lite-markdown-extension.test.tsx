/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react'
import { TestMarkdownRenderer } from '../../test-utils/test-markdown-renderer'
import React from 'react'
import { mockI18n } from '../../test-utils/mock-i18n'
import { VegaLiteMarkdownExtension } from './vega-lite-markdown-extension'
import * as VegaLiteChartModule from '../vega-lite/vega-lite-chart'
import type { CodeProps } from '../../replace-components/code-block-component-replacer'

jest.mock('../vega-lite/vega-lite-chart')

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
