/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockNoteOwnership } from '../../../test-utils/note-ownership'
import { mockI18n } from '../../markdown-renderer/test-utils/mock-i18n'
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
    mockNoteOwnership('test', 'test')
    const onConfirm = jest.fn()
    render(
      <DeletionModal onConfirm={onConfirm} deletionButtonI18nKey={'testDeletionButton'} show={true}>
        testText
      </DeletionModal>
    )
    const modal = await screen.findByTestId('commonModal')
    expect(modal).toMatchSnapshot()
  })

  it('disables deletion when user is not owner', async () => {
    mockNoteOwnership('test2', 'test')
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
