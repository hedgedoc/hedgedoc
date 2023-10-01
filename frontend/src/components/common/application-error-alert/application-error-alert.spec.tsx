/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react'
import { ApplicationErrorAlert } from './application-error-alert'

jest.mock('./alert-icon', () => require('../../../test-utils/mock-component').mockComponent('AlertIcon'))

describe('ApplicationErrorAlert', () => {
  it('renders correctly', () => {
    const view = render(
      <ApplicationErrorAlert className={'test-class'}>
        <span>Test Child</span>
      </ApplicationErrorAlert>
    )

    expect(view.container).toMatchSnapshot()
  })
})
