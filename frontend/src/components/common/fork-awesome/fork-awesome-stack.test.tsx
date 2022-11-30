/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ForkAwesomeIconProps } from './fork-awesome-icon'
import { ForkAwesomeIcon } from './fork-awesome-icon'
import { ForkAwesomeStack } from './fork-awesome-stack'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

describe('ForkAwesomeStack', () => {
  const stack: Array<ReactElement<ForkAwesomeIconProps>> = [
    <ForkAwesomeIcon icon={'heart'} key={'heart'} />,
    <ForkAwesomeIcon icon={'download'} key={'download'} />
  ]
  it('renders a heart and a download icon stack', () => {
    const view = render(<ForkAwesomeStack>{stack}</ForkAwesomeStack>)
    expect(view.container).toMatchSnapshot()
  })
  describe('renders in size', () => {
    it('2x', () => {
      const view = render(<ForkAwesomeStack size={'2x'}>{stack}</ForkAwesomeStack>)
      expect(view.container).toMatchSnapshot()
    })
    it('3x', () => {
      const view = render(<ForkAwesomeStack size={'3x'}>{stack}</ForkAwesomeStack>)
      expect(view.container).toMatchSnapshot()
    })
    it('4x', () => {
      const view = render(<ForkAwesomeStack size={'4x'}>{stack}</ForkAwesomeStack>)
      expect(view.container).toMatchSnapshot()
    })
    it('5x', () => {
      const view = render(<ForkAwesomeStack size={'5x'}>{stack}</ForkAwesomeStack>)
      expect(view.container).toMatchSnapshot()
    })
  })
})
