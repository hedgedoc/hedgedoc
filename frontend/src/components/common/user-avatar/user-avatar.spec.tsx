/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { render } from '@testing-library/react'
import { UserAvatar } from './user-avatar'
import type { UserInfoDto } from '@hedgedoc/commons'

jest.mock('@dicebear/identicon', () => null)
jest.mock('@dicebear/core', () => ({
  createAvatar: jest.fn(() => ({
    toDataUri: jest.fn(() => 'data:image/x-other,identicon-mock')
  }))
}))

describe('UserAvatar', () => {
  const user: UserInfoDto = {
    username: 'boatface',
    displayName: 'Boaty McBoatFace',
    photoUrl: 'https://example.com/test.png'
  }

  const userWithoutPhoto: UserInfoDto = {
    username: 'pictureless',
    displayName: 'No face user',
    photoUrl: null
  }

  const userWithEmptyPhoto: UserInfoDto = {
    username: 'void',
    displayName: 'Empty',
    photoUrl: ''
  }

  beforeEach(async () => {
    await mockI18n()
  })

  it('renders the user avatar correctly', () => {
    const view = render(<UserAvatar user={user} />)
    expect(view.container).toMatchSnapshot()
  })
  describe('renders the user avatar in size', () => {
    it('sm', () => {
      const view = render(<UserAvatar user={user} size={'sm'} />)
      expect(view.container).toMatchSnapshot()
    })
    it('lg', () => {
      const view = render(<UserAvatar user={user} size={'lg'} />)
      expect(view.container).toMatchSnapshot()
    })
  })
  it('adds additionalClasses props to wrapping span', () => {
    const view = render(<UserAvatar user={user} additionalClasses={'testClass'} />)
    expect(view.container).toMatchSnapshot()
  })
  it('does not show names if showName prop is false', () => {
    const view = render(<UserAvatar user={user} showName={false} />)
    expect(view.container).toMatchSnapshot()
  })

  it('uses identicon when no photoUrl is given', () => {
    const view = render(<UserAvatar user={userWithoutPhoto} />)
    expect(view.container).toMatchSnapshot()
  })

  it('uses identicon when empty photoUrl is given', () => {
    const view = render(<UserAvatar user={userWithEmptyPhoto} />)
    expect(view.container).toMatchSnapshot()
  })

  it('uses custom photo component if provided', () => {
    const view = render(<UserAvatar user={userWithoutPhoto} photoComponent={<div>Custom Photo</div>} />)
    expect(view.container).toMatchSnapshot()
  })

  it('uses custom photo component preferred over photoUrl', () => {
    const view = render(<UserAvatar user={user} photoComponent={<div>Custom Photo</div>} />)
    expect(view.container).toMatchSnapshot()
  })
})
