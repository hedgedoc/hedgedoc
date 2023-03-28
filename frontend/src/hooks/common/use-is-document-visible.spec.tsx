/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsDocumentVisible } from './use-is-document-visible'
import { fireEvent, render } from '@testing-library/react'
import React, { Fragment } from 'react'

describe('use is document visible', () => {
  const TestComponent: React.FC = () => {
    const visible = useIsDocumentVisible()
    return <Fragment>{String(visible)}</Fragment>
  }

  it('returns the correct value', () => {
    const view = render(<TestComponent />)
    expect(view.container.textContent).toBe('true')
    fireEvent(window, new Event('blur'))
    expect(view.container.textContent).toBe('false')
    fireEvent(window, new Event('focus'))
    expect(view.container.textContent).toBe('true')
  })
})
