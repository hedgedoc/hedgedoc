/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { render } from '@testing-library/react'
import { GuestUserAvatar } from './guest-user-avatar'

jest.mock('@dicebear/identicon', () => null)
jest.mock('@dicebear/core', () => ({
  createAvatar: jest.fn(() => ({
    toDataUri: jest.fn(() => 'data:image/x-other,identicon-mock')
  }))
}))

describe('GuestUserAvatar', () => {
  beforeEach(async () => {
    await mockI18n()
  })

  it('renders the guest user avatar correctly', () => {
    const view = render(<GuestUserAvatar />)
    expect(view.container).toMatchSnapshot()
  })
})
