/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ShowIf } from './show-if'
import { render } from '@testing-library/react'

describe('ShowIf', () => {
  it('renders child if condition is true', () => {
    const view = render(<ShowIf condition={true}>test</ShowIf>)
    expect(view.container).toMatchSnapshot()
  })

  it('does not render child if condition is false', () => {
    const view = render(<ShowIf condition={false}>test</ShowIf>)
    expect(view.container).toMatchSnapshot()
  })
})
