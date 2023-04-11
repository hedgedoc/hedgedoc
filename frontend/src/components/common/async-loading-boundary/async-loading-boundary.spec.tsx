/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { AsyncLoadingBoundary } from './async-loading-boundary'
import { render } from '@testing-library/react'

describe('Async loading boundary', () => {
  beforeAll(() => mockI18n())

  it('shows the children if not loading and no error', () => {
    const view = render(
      <AsyncLoadingBoundary loading={false} componentName={'test'}>
        children
      </AsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })

  it('shows a waiting spinner if loading', () => {
    const view = render(
      <AsyncLoadingBoundary loading={true} componentName={'test'}>
        children
      </AsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })

  it('shows an error if error is given without loading', () => {
    const view = render(
      <AsyncLoadingBoundary loading={false} error={new Error('error')} componentName={'test'}>
        children
      </AsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })

  it('shows an error if error is given with loading', () => {
    const view = render(
      <AsyncLoadingBoundary loading={true} error={new Error('error')} componentName={'test'}>
        children
      </AsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })
})
