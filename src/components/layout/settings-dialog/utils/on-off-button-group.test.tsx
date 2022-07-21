/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act, render, screen } from '@testing-library/react'
import { OnOffButtonGroup } from './on-off-button-group'
import { mockI18n } from '../../../markdown-renderer/test-utils/mock-i18n'

describe('Settings On-Off Button Group', () => {
  beforeAll(mockI18n)

  it('can switch value', async () => {
    let value = false
    const onSelect = (newValue: boolean) => (value = newValue)

    const view = render(<OnOffButtonGroup value={value} onSelect={onSelect} />)
    expect(view.container).toMatchSnapshot()
    const onButton = await screen.findByTestId('onOffButtonGroupOn')
    act(() => {
      onButton.click()
    })
    expect(value).toBeTruthy()

    view.rerender(<OnOffButtonGroup value={value} onSelect={onSelect} />)
    expect(view.container).toMatchSnapshot()
    const offButton = await screen.findByTestId('onOffButtonGroupOff')
    act(() => {
      offButton.click()
    })
    expect(value).toBeFalsy()
  })
})
