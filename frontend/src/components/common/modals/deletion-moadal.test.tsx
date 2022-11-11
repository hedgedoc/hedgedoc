/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
import { render, screen } from '@testing-library/react'
import { DeletionModal } from './deletion-modal'

describe('DeletionModal', () => {
  it('renders correctly with deletionButtonI18nKey', async () => {
    await mockI18n()
    const onConfirm = jest.fn()
    render(
      <DeletionModal onConfirm={onConfirm} deletionButtonI18nKey={'testDeletionButton'} show={true}>
        testText
      </DeletionModal>
    )
    const modal = await screen.findByTestId('commonModal')
    expect(modal).toMatchSnapshot()
  })
})
