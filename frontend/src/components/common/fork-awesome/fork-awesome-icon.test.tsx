/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from './fork-awesome-icon'
import type { IconName } from './types'
import { render } from '@testing-library/react'

describe('ForkAwesomeIcon', () => {
  const icon: IconName = 'heart'
  it('renders a heart correctly', () => {
    const view = render(<ForkAwesomeIcon icon={icon} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders with fixed width icon', () => {
    const view = render(<ForkAwesomeIcon icon={icon} fixedWidth={true} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders with additional className', () => {
    const view = render(<ForkAwesomeIcon icon={icon} className={'testClass'} />)
    expect(view.container).toMatchSnapshot()
  })
  describe('renders in size', () => {
    it('2x', () => {
      const view = render(<ForkAwesomeIcon icon={icon} size={'2x'} />)
      expect(view.container).toMatchSnapshot()
    })
    it('3x', () => {
      const view = render(<ForkAwesomeIcon icon={icon} size={'3x'} />)
      expect(view.container).toMatchSnapshot()
    })
    it('4x', () => {
      const view = render(<ForkAwesomeIcon icon={icon} size={'4x'} />)
      expect(view.container).toMatchSnapshot()
    })
    it('5x', () => {
      const view = render(<ForkAwesomeIcon icon={icon} size={'5x'} />)
      expect(view.container).toMatchSnapshot()
    })
  })
  describe('renders in stack', () => {
    const view = render(<ForkAwesomeIcon icon={icon} stacked={true} />)
    expect(view.container).toMatchSnapshot()
  })
})
