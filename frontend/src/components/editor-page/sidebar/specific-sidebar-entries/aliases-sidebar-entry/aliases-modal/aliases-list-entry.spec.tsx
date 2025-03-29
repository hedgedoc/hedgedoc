/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as AliasModule from '../../../../../../api/alias'
import * as NoteDetailsReduxModule from '../../../../../../redux/note-details/methods'
import { mockI18n } from '../../../../../../test-utils/mock-i18n'
import { mockNotePermissions } from '../../../../../../test-utils/mock-note-permissions'
import { AliasesListEntry } from './aliases-list-entry'
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { mockUiNotifications } from '../../../../../../test-utils/mock-ui-notifications'
import type { AliasDto } from '@hedgedoc/commons'

jest.mock('../../../../../../api/alias')
jest.mock('../../../../../../redux/note-details/methods')
jest.mock('../../../../../notifications/ui-notification-boundary')
jest.mock('../../../../../../hooks/common/use-application-state')

const deletePromise = Promise.resolve()
const markAsPrimaryPromise = Promise.resolve({ name: 'mock', primaryAlias: true, noteId: 'mock' })

describe('AliasesListEntry', () => {
  beforeEach(async () => {
    await mockI18n()
    mockUiNotifications()
    jest.spyOn(AliasModule, 'deleteAlias').mockImplementation(() => deletePromise)
    jest.spyOn(AliasModule, 'markAliasAsPrimary').mockImplementation(() => markAsPrimaryPromise)
    jest.spyOn(NoteDetailsReduxModule, 'updateMetadata').mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders an AliasesListEntry that is primary', async () => {
    mockNotePermissions('test', 'test')
    const testAlias: AliasDto = {
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

  it("adds aliasPrimaryBadge & removes aliasButtonMakePrimary in AliasesListEntry if it's primary", () => {
    mockNotePermissions('test2', 'test')
    const testAlias: AliasDto = {
      name: 'test-primary',
      primaryAlias: true,
      noteId: 'test-note-id'
    }
    const view = render(<AliasesListEntry alias={testAlias} />)
    expect(view.container).toMatchSnapshot()
  })

  it('renders an AliasesListEntry that is not primary', async () => {
    mockNotePermissions('test', 'test')
    const testAlias: AliasDto = {
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

  it("removes aliasPrimaryBadge & adds aliasButtonMakePrimary in AliasesListEntry if it's not primary", () => {
    mockNotePermissions('test2', 'test')
    const testAlias: AliasDto = {
      name: 'test-primary',
      primaryAlias: false,
      noteId: 'test-note-id'
    }
    const view = render(<AliasesListEntry alias={testAlias} />)
    expect(view.container).toMatchSnapshot()
  })
})
