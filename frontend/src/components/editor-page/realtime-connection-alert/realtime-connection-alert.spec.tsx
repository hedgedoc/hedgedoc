/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as UseApplicationStateModule from '../../../hooks/common/use-application-state'
import { mockI18n } from '../../../test-utils/mock-i18n'
import { RealtimeConnectionAlert } from './realtime-connection-alert'
import { render } from '@testing-library/react'

jest.mock('../../../hooks/common/use-application-state')

describe('realtime connection alert', () => {
  beforeAll(mockI18n)

  it("won't show if synced", () => {
    jest.spyOn(UseApplicationStateModule, 'useApplicationState').mockImplementation(() => true)

    const view = render(<RealtimeConnectionAlert />)
    expect(view.container).toMatchSnapshot()
  })

  it('will show if not synced', () => {
    jest.spyOn(UseApplicationStateModule, 'useApplicationState').mockImplementation(() => false)

    const view = render(<RealtimeConnectionAlert />)
    expect(view.container).toMatchSnapshot()
  })
})
