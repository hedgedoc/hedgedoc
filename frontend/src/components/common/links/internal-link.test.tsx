/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { InternalLink } from './internal-link'
import { render } from '@testing-library/react'

describe('InternalLink', () => {
  const href = '/test'
  const text = 'testText'
  it('renders an internal link correctly', () => {
    const view = render(<InternalLink text={text} href={href} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an internal link with an icon', () => {
    const view = render(<InternalLink text={text} href={href} icon={'heart'} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an internal link with an id', () => {
    const view = render(<InternalLink text={text} href={href} id={'testId'} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an internal link with additional className', () => {
    const view = render(<InternalLink text={text} href={href} className={'testClass'} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an internal link with a title', () => {
    const view = render(<InternalLink text={text} href={href} title={'testTitle'} />)
    expect(view.container).toMatchSnapshot()
  })
})
