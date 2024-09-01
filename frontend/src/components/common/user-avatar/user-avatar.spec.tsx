/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { UserInfo } from '../../../api/users/types'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { UserAvatarForUser } from './user-avatar-for-user'
import { render } from '@testing-library/react'
import { UserAvatar } from './user-avatar'

jest.mock('@dicebear/identicon', () => null)
jest.mock('@dicebear/core', () => ({
  createAvatar: jest.fn(() => ({
    toDataUri: jest.fn(() => 'data:image/x-other,identicon-mock')
  }))
}))

describe('UserAvatar', () => {
  const user: UserInfo = {
    username: 'boatface',
    displayName: 'Boaty McBoatFace',
    photoUrl: 'https://example.com/test.png'
  }

  beforeEach(async () => {
    await mockI18n()
  })

  it('renders the user avatar correctly', () => {
    const view = render(<UserAvatarForUser user={user} />)
    expect(view.container).toMatchSnapshot()
  })
  describe('renders the user avatar in size', () => {
    it('sm', () => {
      const view = render(<UserAvatarForUser user={user} size={'sm'} />)
      expect(view.container).toMatchSnapshot()
    })
    it('lg', () => {
      const view = render(<UserAvatarForUser user={user} size={'lg'} />)
      expect(view.container).toMatchSnapshot()
    })
  })
  it('adds additionalClasses props to wrapping span', () => {
    const view = render(<UserAvatarForUser user={user} additionalClasses={'testClass'} />)
    expect(view.container).toMatchSnapshot()
  })
  it('does not show names if showName prop is false', () => {
    const view = render(<UserAvatarForUser user={user} showName={false} />)
    expect(view.container).toMatchSnapshot()
  })

  it('uses identicon when no photoUrl is given', () => {
    const view = render(<UserAvatar displayName={'test'} />)
    expect(view.container).toMatchSnapshot()
  })

  it('uses identicon when empty photoUrl is given', () => {
    const view = render(<UserAvatar displayName={'test'} photoUrl={''} />)
    expect(view.container).toMatchSnapshot()
  })
})
