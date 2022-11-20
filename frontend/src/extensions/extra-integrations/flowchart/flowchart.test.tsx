/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render, screen } from '@testing-library/react'
import { FlowChart } from './flowchart'
import type * as flowchartJsModule from 'flowchart.js'
import { mockI18n } from '../../../components/markdown-renderer/test-utils/mock-i18n'
import { StoreProvider } from '../../../redux/store-provider'
import * as useMediaQuery from '@restart/hooks/useMediaQuery'

jest.mock('@restart/hooks/useMediaQuery')

describe('Flowchart', () => {
  const successText = 'Flowchart rendering succeeded!'
  const expectedValidFlowchartCode = 'test code'

  beforeAll(async () => {
    jest.spyOn(useMediaQuery, 'default').mockImplementation(() => false)
    await mockI18n()
  })

  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })

  const mockFlowchartDraw = (): jest.Mock<void, Parameters<flowchartJsModule.Instance['drawSVG']>> => {
    const drawSvg = jest.fn((container: HTMLElement | string) => {
      if (typeof container === 'string') {
        throw new Error('HTMLElement expected')
      } else {
        container.innerHTML = successText
      }
    })
    jest.mock('flowchart.js', () => ({
      parse: jest.fn((code) => {
        if (code !== expectedValidFlowchartCode) {
          throw new Error('invalid flowchart code')
        }
        return { drawSVG: drawSvg, clean: jest.fn() }
      })
    }))
    return drawSvg
  }

  it('renders correctly', async () => {
    const successText = 'Flowchart rendering succeeded!'
    const validFlowchartCode = 'test code'
    const mockDrawSvg = mockFlowchartDraw()

    const view = render(
      <StoreProvider>
        <FlowChart code={validFlowchartCode} />
      </StoreProvider>
    )
    await screen.findByText(successText)
    expect(view.container).toMatchSnapshot()
    expect(mockDrawSvg).toBeCalled()
  })

  it('handles error while rendering', async () => {
    const mockDrawSvg = mockFlowchartDraw()

    const view = render(
      <StoreProvider>
        <FlowChart code={'Invalid!'} />
      </StoreProvider>
    )
    await screen.findByText('renderer.flowchart.invalidSyntax')
    expect(view.container).toMatchSnapshot()
    expect(mockDrawSvg).not.toBeCalled()
  })

  it('handles error if lib loading failed', async () => {
    jest.mock('flowchart.js', () => {
      throw new Error('flowchart.js import is exploded!')
    })

    const view = render(
      <StoreProvider>
        <FlowChart code={'Invalid!'} />
      </StoreProvider>
    )
    await screen.findByText('common.errorWhileLoading')
    expect(view.container).toMatchSnapshot()
  })
})
