/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { IconName } from '../fork-awesome/types'
import { IconButton } from './icon-button'
import { fireEvent, render, screen } from '@testing-library/react'

describe('IconButton', () => {
  const icon: IconName = 'heart'
  it('renders heart icon', () => {
    const view = render(<IconButton icon={icon}>test</IconButton>)
    expect(view.container).toMatchSnapshot()
  })
  it('renders with border', () => {
    const view = render(
      <IconButton icon={icon} border={true}>
        test with border
      </IconButton>
    )
    expect(view.container).toMatchSnapshot()
  })
  it('renders with fixed width icon', () => {
    const view = render(
      <IconButton icon={icon} iconFixedWidth={true}>
        test with fixed with icon
      </IconButton>
    )
    expect(view.container).toMatchSnapshot()
  })
  it('renders with additional className', () => {
    const view = render(
      <IconButton icon={icon} className={'testClass'}>
        test with additional className
      </IconButton>
    )
    expect(view.container).toMatchSnapshot()
  })
  it('correctly uses the onClick callback', async () => {
    const onClick = jest.fn()
    const view = render(
      <IconButton icon={icon} onClick={onClick}>
        test with onClick
      </IconButton>
    )
    expect(view.container).toMatchSnapshot()
    const iconButton = await screen.findByTestId('icon-button')
    fireEvent(
      iconButton,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
    )
    expect(onClick).toHaveBeenCalled()
  })
})
