/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { OnOffButtonGroup } from './on-off-button-group'
import { act, render, screen } from '@testing-library/react'

describe('Settings On-Off Button Group', () => {
  beforeAll(mockI18n)

  it('can switch value', async () => {
    let value = false
    const onSelect = (newValue: boolean) => (value = newValue)

    const view = render(<OnOffButtonGroup value={value} onSelect={onSelect} />)
    expect(view.container).toMatchSnapshot()
    const onButton = await screen.findByTestId('onOffButtonGroupOn')
    await act<void>(() => {
      onButton.click()
    })
    expect(value).toBeTruthy()

    view.rerender(<OnOffButtonGroup value={value} onSelect={onSelect} />)
    expect(view.container).toMatchSnapshot()
    const offButton = await screen.findByTestId('onOffButtonGroupOff')
    await act<void>(() => {
      offButton.click()
    })
    expect(value).toBeFalsy()
  })
})
