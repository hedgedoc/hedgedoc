/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { LanguagePicker } from './language-picker'
import { fireEvent, render, screen } from '@testing-library/react'
import i18n from 'i18next'

jest.mock('./available-languages', () => ({
  availableLanguages: jest.fn(() => ['de', 'en'])
}))

describe('language picker', () => {
  beforeAll(() => mockI18n())

  it('renders all languages', () => {
    const view = render(<LanguagePicker />)
    expect(view.container).toMatchSnapshot()
    expect(i18n.language).toBe('en')
  })

  it('can change the language', async () => {
    render(<LanguagePicker />)

    const option: HTMLOptionElement = await screen.findByText('Deutsch')

    expect(option.selected).toBeFalsy()
    expect(i18n.language).toBe('en')

    fireEvent.change(screen.getByTestId('language-picker'), { target: { value: 'de' } })

    expect(option.selected).toBeTruthy()
    expect(i18n.language).toBe('de')
  })
})
