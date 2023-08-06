/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { TranslatedApplicationErrorAlert } from './translated-application-error-alert'
import type { PropsWithChildren } from 'react'
import React from 'react'

jest.mock('./application-error-alert', () => ({
  ApplicationErrorAlert: ({ children, ...props }: PropsWithChildren) => (
    <div>
      <h3>This is a mock for ApplicationErrorAlert.</h3>
      Props: <code>{JSON.stringify(props)}</code>
      Children:
      <div>{children}</div>
    </div>
  )
}))

describe('TranslatedApplicationErrorAlert', () => {
  beforeAll(() => mockI18n())

  it('renders correctly', () => {
    const view = render(<TranslatedApplicationErrorAlert errorI18nKey={'testKey'} className={'test-css-class'} />)

    expect(view.container).toMatchSnapshot()
  })
})
