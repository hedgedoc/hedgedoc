/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { IconButton } from './icon-button'
import { fireEvent, render, screen } from '@testing-library/react'
import { Heart as IconHeart } from 'react-bootstrap-icons'

describe('IconButton', () => {
  it('renders heart icon', () => {
    const view = render(<IconButton icon={IconHeart}>test</IconButton>)
    expect(view.container).toMatchSnapshot()
  })
  it('renders with border', () => {
    const view = render(
      <IconButton icon={IconHeart} border={true}>
        test with border
      </IconButton>
    )
    expect(view.container).toMatchSnapshot()
  })
  it('renders with additional className', () => {
    const view = render(
      <IconButton icon={IconHeart} className={'testClass'}>
        test with additional className
      </IconButton>
    )
    expect(view.container).toMatchSnapshot()
  })
  it('correctly uses the onClick callback', async () => {
    const onClick = jest.fn()
    const view = render(
      <IconButton icon={IconHeart} onClick={onClick}>
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
