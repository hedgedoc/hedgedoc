/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../test-utils/mock-i18n'
import { mockNotePermissions } from '../../../test-utils/mock-note-permissions'
import { DeletionModal } from './deletion-modal'
import { render, screen } from '@testing-library/react'

describe('DeletionModal', () => {
  beforeEach(async () => {
    await mockI18n()
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders correctly with deletionButtonI18nKey', async () => {
    mockNotePermissions('test', 'test')
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
