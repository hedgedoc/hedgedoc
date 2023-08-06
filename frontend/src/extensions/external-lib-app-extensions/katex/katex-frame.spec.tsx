/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import KatexFrame from './katex-frame'
import { render } from '@testing-library/react'
import type { KatexOptions } from 'katex'
import { default as KatexDefault } from 'katex'
import type { PropsWithChildren } from 'react'
import React from 'react'

jest.mock('katex')

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

describe('katex frame', () => {
  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  beforeEach(() => {
    jest.spyOn(KatexDefault, 'renderToString').mockImplementation(
      (tex: string, options?: KatexOptions) => `<span>This is a mock for lib katex with this parameters:</span>
<span>
  <span>tex: ${tex}</span>
  <span>block: ${String(options?.displayMode)}</span>
</span>`
    )
  })

  describe('renders a valid latex expression', () => {
    it('as implicit inline', () => {
      const view = render(<KatexFrame expression={'\\int_0^\\infty x^2 dx'}></KatexFrame>)
      expect(view.container).toMatchSnapshot()
    })
    it('as explicit inline', () => {
      const view = render(<KatexFrame expression={'\\int_0^\\infty x^2 dx'} block={false}></KatexFrame>)
      expect(view.container).toMatchSnapshot()
    })
    it('as explicit block', () => {
      const view = render(<KatexFrame expression={'\\int_0^\\infty x^2 dx'} block={true}></KatexFrame>)
      expect(view.container).toMatchSnapshot()
    })
  })

  describe('renders an error for an invalid latex expression', () => {
    beforeEach(() => {
      jest.spyOn(KatexDefault, 'renderToString').mockImplementation(() => {
        throw new Error('mocked parseerror')
      })
    })

    it('as implicit inline', () => {
      const view = render(<KatexFrame expression={'\\alf'}></KatexFrame>)
      expect(view.container).toMatchSnapshot()
    })
    it('as explicit inline', () => {
      const view = render(<KatexFrame expression={'\\alf'} block={false}></KatexFrame>)
      expect(view.container).toMatchSnapshot()
    })
    it('as explicit block', () => {
      const view = render(<KatexFrame expression={'\\alf'} block={true}></KatexFrame>)
      expect(view.container).toMatchSnapshot()
    })
  })
})
