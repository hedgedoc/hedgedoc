/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { render } from '@testing-library/react'
import { ApplicationErrorAlert } from './application-error-alert'
import type { AlertIconProps } from './alert-icon'
import { describe, expect, it, vitest, beforeAll, afterAll } from 'vitest'
import { vi } from 'vitest'

vi.mock('./alert-icon', () => ({
  AlertIcon: (props: AlertIconProps) => `This is a mock for "AlertIcon". Props: ${JSON.stringify(props)}`
}))

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
