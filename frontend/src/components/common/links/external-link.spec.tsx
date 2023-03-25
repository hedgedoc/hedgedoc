/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ExternalLink } from './external-link'
import { render } from '@testing-library/react'
import { Heart as IconHeart } from 'react-bootstrap-icons'

describe('ExternalLink', () => {
  const href = 'https://example.com'
  const text = 'testText'
  it('renders an external link correctly', () => {
    const view = render(<ExternalLink text={text} href={href} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an external link with an icon', () => {
    const view = render(<ExternalLink text={text} href={href} icon={IconHeart} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an external link with an id', () => {
    const view = render(<ExternalLink text={text} href={href} id={'testId'} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an external link with additional className', () => {
    const view = render(<ExternalLink text={text} href={href} className={'testClass'} />)
    expect(view.container).toMatchSnapshot()
  })
  it('renders an external link with a title', () => {
    const view = render(<ExternalLink text={text} href={href} title={'testTitle'} />)
    expect(view.container).toMatchSnapshot()
  })
})
