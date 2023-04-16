/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as AliasModule from '../../../../../../api/alias'
import type { Alias } from '../../../../../../api/alias/types'
import * as NoteDetailsReduxModule from '../../../../../../redux/note-details/methods'
import { mockI18n } from '../../../../../../test-utils/mock-i18n'
import { mockNoteOwnership } from '../../../../../../test-utils/note-ownership'
import * as useUiNotificationsModule from '../../../../../notifications/ui-notification-boundary'
import { AliasesListEntry } from './aliases-list-entry'
import { render, act, screen } from '@testing-library/react'
import React from 'react'

jest.mock('../../../../../../api/alias')
jest.mock('../../../../../../redux/note-details/methods')
jest.mock('../../../../../notifications/ui-notification-boundary')
// This needs to be mocked here in addition to note-ownership.ts, because jest doesn't work otherwise
jest.mock('../../../../../../hooks/common/use-application-state')

const deletePromise = Promise.resolve()
const markAsPrimaryPromise = Promise.resolve({ name: 'mock', primaryAlias: true, noteId: 'mock' })

describe('AliasesListEntry', () => {
  beforeEach(async () => {
    await mockI18n()
    jest.spyOn(AliasModule, 'deleteAlias').mockImplementation(() => deletePromise)
    jest.spyOn(AliasModule, 'markAliasAsPrimary').mockImplementation(() => markAsPrimaryPromise)
    jest.spyOn(NoteDetailsReduxModule, 'updateMetadata').mockImplementation(() => Promise.resolve())
    jest.spyOn(useUiNotificationsModule, 'useUiNotifications').mockReturnValue({
      showErrorNotification: jest.fn(),
      dismissNotification: jest.fn(),
      dispatchUiNotification: jest.fn()
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders an AliasesListEntry that is primary', async () => {
    mockNoteOwnership('test', 'test')
    const testAlias: Alias = {
      name: 'test-primary',
      primaryAlias: true,
      noteId: 'test-note-id'
    }
    const view = render(<AliasesListEntry alias={testAlias} />)
    expect(view.container).toMatchSnapshot()
    const button = await screen.findByTestId('aliasButtonRemove')
    await act<void>(() => {
      button.click()
    })
    expect(AliasModule.deleteAlias).toBeCalledWith(testAlias.name)
    await deletePromise
    expect(NoteDetailsReduxModule.updateMetadata).toBeCalled()
  })

  it("disables button in AliasesListEntry if it's primary", () => {
    mockNoteOwnership('test2', 'test')
    const testAlias: Alias = {
      name: 'test-primary',
      primaryAlias: true,
      noteId: 'test-note-id'
    }
    const view = render(<AliasesListEntry alias={testAlias} />)
    expect(view.container).toMatchSnapshot()
  })

  it('renders an AliasesListEntry that is not primary', async () => {
    mockNoteOwnership('test', 'test')
    const testAlias: Alias = {
      name: 'test-non-primary',
      primaryAlias: false,
      noteId: 'test-note-id'
    }
    const view = render(<AliasesListEntry alias={testAlias} />)
    expect(view.container).toMatchSnapshot()
    const buttonRemove = await screen.findByTestId('aliasButtonRemove')
    await act<void>(() => {
      buttonRemove.click()
    })
    expect(AliasModule.deleteAlias).toBeCalledWith(testAlias.name)
    await deletePromise
    expect(NoteDetailsReduxModule.updateMetadata).toBeCalled()
    const buttonMakePrimary = await screen.findByTestId('aliasButtonMakePrimary')
    await act<void>(() => {
      buttonMakePrimary.click()
    })
    expect(AliasModule.markAliasAsPrimary).toBeCalledWith(testAlias.name)
    await markAsPrimaryPromise
    expect(NoteDetailsReduxModule.updateMetadata).toBeCalled()
  })

  it("disables button in AliasesListEntry if it's not primary", () => {
    mockNoteOwnership('test2', 'test')
    const testAlias: Alias = {
      name: 'test-primary',
      primaryAlias: false,
      noteId: 'test-note-id'
    }
    const view = render(<AliasesListEntry alias={testAlias} />)
    expect(view.container).toMatchSnapshot()
  })
})
