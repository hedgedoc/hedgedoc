/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { CustomAsyncLoadingBoundary } from './custom-async-loading-boundary'
import { render } from '@testing-library/react'

describe('Custom error async loading boundary', () => {
  beforeAll(() => mockI18n())

  it('shows the children if not loading and no error', () => {
    const view = render(
      <CustomAsyncLoadingBoundary loading={false} errorComponent={'error'} loadingComponent={'wait'}>
        children
      </CustomAsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })

  it('shows a waiting spinner if loading', () => {
    const view = render(
      <CustomAsyncLoadingBoundary loading={true} errorComponent={'error'} loadingComponent={'wait'}>
        children
      </CustomAsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })

  it('shows an error if error is given without loading', () => {
    const view = render(
      <CustomAsyncLoadingBoundary
        loading={false}
        error={new Error('error')}
        errorComponent={'error'}
        loadingComponent={'wait'}>
        children
      </CustomAsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })

  it('shows an error if error is given with loading', () => {
    const view = render(
      <CustomAsyncLoadingBoundary
        loading={true}
        error={new Error('error')}
        errorComponent={'error'}
        loadingComponent={'wait'}>
        children
      </CustomAsyncLoadingBoundary>
    )
    expect(view.container).toMatchSnapshot()
  })
})
