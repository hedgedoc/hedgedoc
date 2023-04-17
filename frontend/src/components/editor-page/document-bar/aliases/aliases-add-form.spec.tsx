/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as AliasModule from '../../../../api/alias'
import * as NoteDetailsReduxModule from '../../../../redux/note-details/methods'
import type { NoteDetails } from '../../../../redux/note-details/types/note-details'
import { mockI18n } from '../../../../test-utils/mock-i18n'
import { mockNoteOwnership } from '../../../../test-utils/note-ownership'
import * as useUiNotificationsModule from '../../../notifications/ui-notification-boundary'
import { AliasesAddForm } from './aliases-add-form'
import { render, act, screen } from '@testing-library/react'
import testEvent from '@testing-library/user-event'
import React from 'react'

jest.mock('../../../../api/alias')
jest.mock('../../../../redux/note-details/methods')
jest.mock('../../../../hooks/common/use-application-state')
jest.mock('../../../notifications/ui-notification-boundary')

const addPromise = Promise.resolve({ name: 'mock', primaryAlias: true, noteId: 'mock' })

describe('AliasesAddForm', () => {
  beforeEach(async () => {
    await mockI18n()
    jest.spyOn(AliasModule, 'addAlias').mockImplementation(() => addPromise)
    jest.spyOn(NoteDetailsReduxModule, 'updateMetadata').mockImplementation(() => Promise.resolve())
    jest.spyOn(useUiNotificationsModule, 'useUiNotifications').mockReturnValue({
      showErrorNotification: jest.fn(),
      dismissNotification: jest.fn(),
      dispatchUiNotification: jest.fn()
    })
    mockNoteOwnership('test', 'test', { noteDetails: { id: 'mock-note' } as NoteDetails })
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders the input form', async () => {
    const view = render(<AliasesAddForm />)
    expect(view.container).toMatchSnapshot()
    const button = await screen.findByTestId('addAliasButton')
    expect(button).toBeDisabled()
    const input = await screen.findByTestId('addAliasInput')
    await testEvent.type(input, 'abc')
    expect(button).toBeEnabled()
    await act<void>(() => {
      button.click()
    })
    expect(AliasModule.addAlias).toBeCalledWith('mock-note', 'abc')
    await addPromise
    expect(NoteDetailsReduxModule.updateMetadata).toBeCalled()
  })
})
