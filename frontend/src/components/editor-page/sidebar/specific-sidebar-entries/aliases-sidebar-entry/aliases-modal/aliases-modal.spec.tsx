/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../../../test-utils/mock-i18n'
import type { CommonModalProps } from '../../../../../common/modals/common-modal'
import * as CommonModalModule from '../../../../../common/modals/common-modal'
import * as AliasesAddFormModule from './aliases-add-form'
import * as AliasesListModule from './aliases-list'
import { AliasesModal } from './aliases-modal'
import { render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { mockUiNotifications } from '../../../../../../test-utils/mock-ui-notifications'
import { beforeEach, describe, expect, it, vitest, afterAll } from 'vitest'
import { vi } from 'vitest'

vi.mock('./aliases-list')
vi.mock('./aliases-add-form')
vi.mock('../../../../../common/modals/common-modal')
vi.mock('../../../../../notifications/ui-notification-boundary')

describe('AliasesModal', () => {
  beforeEach(async () => {
    await mockI18n()
    mockUiNotifications()
    vitest.spyOn(CommonModalModule, 'CommonModal').mockImplementation((({ children }) => {
      return (
        <span>
          This is a mock implementation of a Modal: <dialog>{children}</dialog>
        </span>
      )
    }) as React.FC<PropsWithChildren<CommonModalProps>>)
    vitest.spyOn(AliasesListModule, 'AliasesList').mockImplementation((() => {
      return <span>This is a mock for the AliasesList that is tested separately.</span>
    }) as React.FC)
    vitest.spyOn(AliasesAddFormModule, 'AliasesAddForm').mockImplementation((() => {
      return <span>This is a mock for the AliasesAddForm that is tested separately.</span>
    }) as React.FC)
  })

  afterAll(() => {
    vitest.resetAllMocks()
    vitest.resetModules()
  })

  it('renders the modal', () => {
    const view = render(<AliasesModal show={true} />)
    expect(view.container).toMatchSnapshot()
  })
})
