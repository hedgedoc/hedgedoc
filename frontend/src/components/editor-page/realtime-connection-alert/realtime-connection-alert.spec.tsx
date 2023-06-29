/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { RealtimeConnectionAlert } from './realtime-connection-alert'
import { render } from '@testing-library/react'

describe('realtime connection alert', () => {
  beforeAll(mockI18n)

  it('will render correctly', () => {
    const view = render(<RealtimeConnectionAlert />)
    expect(view.container).toMatchSnapshot()
  })
})
