/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useOnInputChange } from './use-on-input-change'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

describe('useOnInputChange', () => {
  it('executes the setter', async () => {
    const callback = jest.fn()
    const testValue = 'testValue'

    const Test: React.FC = () => {
      const onChange = useOnInputChange(callback)
      return <input data-testid={'input'} type={'text'} onChange={onChange} />
    }

    render(<Test></Test>)

    const element: HTMLInputElement = await screen.findByTestId('input')
    fireEvent.change(element, { target: { value: testValue } })

    expect(callback).toBeCalledWith(testValue)
  })
})
