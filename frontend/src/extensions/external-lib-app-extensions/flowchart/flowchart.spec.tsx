/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { StoreProvider } from '../../../redux/store-provider'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { FlowChart } from './flowchart'
import * as useMediaQuery from '@restart/hooks/useMediaQuery'
import { render, screen } from '@testing-library/react'
import type * as flowchartJsModule from 'flowchart.js'
import type { PropsWithChildren } from 'react'
import React from 'react'

jest.mock('@restart/hooks/useMediaQuery')
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
