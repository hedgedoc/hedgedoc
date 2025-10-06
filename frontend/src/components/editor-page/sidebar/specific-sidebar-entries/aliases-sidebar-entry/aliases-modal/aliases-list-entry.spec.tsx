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

jest.mock('../../../../../../api/alias')
jest.mock('../../../../../../redux/note-details/methods')
jest.mock('../../../../../notifications/ui-notification-boundary')
jest.mock('../../../../../../hooks/common/use-application-state')

const deletePromise = Promise.resolve()
const markAsPrimaryPromise = Promise.resolve({ name: 'mock-alias', isPrimaryAlias: true })

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

  it('allows primary alias not to be deleted', async () => {
    mockNotePermissions('test', 'test', undefined, {
      noteDetails: { primaryAlias: 'mock-alias-primary' }
    })
    const view = render(<AliasesListEntry alias={'mock-alias-primary'} />)
    expect(view.container).toMatchSnapshot()
    const button = await screen.findByTestId('aliasButtonRemove')
    expect(button).toBeDisabled()
    await act<void>(() => {
      button.click()
    })
    expect(AliasModule.deleteAlias).not.toBeCalledWith('mock-alias-primary')
  })

  it('renders an AliasesListEntry that is primary', () => {
    mockNotePermissions('test', 'test', undefined, {
      noteDetails: { primaryAlias: 'test-primary' }
    })
    const view = render(<AliasesListEntry alias={'test-primary'} />)
    expect(view.container).toMatchSnapshot()
  })

  it('removes alias if non-primary', async () => {
    mockNotePermissions('test', 'test', undefined, {
      noteDetails: { primaryAlias: 'mock-alias-primary' }
    })
    const view = render(<AliasesListEntry alias={'mock-alias-other'} />)
    expect(view.container).toMatchSnapshot()
    const buttonRemove = await screen.findByTestId('aliasButtonRemove')
    await act<void>(() => {
      buttonRemove.click()
    })
    expect(AliasModule.deleteAlias).toBeCalledWith('mock-alias-other')
    await deletePromise
    expect(NoteDetailsReduxModule.updateMetadata).toBeCalled()
  })

  it('marks alias as primary if non-primary', async () => {
    mockNotePermissions('test', 'test', undefined, {
      noteDetails: { primaryAlias: 'mock-alias-primary' }
    })
    const view = render(<AliasesListEntry alias={'mock-alias-other'} />)
    expect(view.container).toMatchSnapshot()
    const buttonMakePrimary = await screen.findByTestId('aliasButtonMakePrimary')
    await act<void>(() => {
      buttonMakePrimary.click()
    })
    expect(AliasModule.markAliasAsPrimary).toBeCalledWith('mock-alias-other')
    await markAsPrimaryPromise
    expect(NoteDetailsReduxModule.updateMetadata).toBeCalled()
  })

  it('renders an AliasesListEntry that is not primary', () => {
    mockNotePermissions('test', 'test', undefined, {
      noteDetails: { primaryAlias: 'mock-alias-primary' }
    })
    const view = render(<AliasesListEntry alias={'mock-alias-other'} />)
    expect(view.container).toMatchSnapshot()
  })

  it('disables remove button if not owner', async () => {
    mockNotePermissions('test', 'read', undefined, {
      noteDetails: { primaryAlias: 'mock-alias-primary' }
    })
    const view = render(<AliasesListEntry alias={'mock-alias-primary'} />)
    expect(view.container).toMatchSnapshot()
    const buttonRemove = await screen.findByTestId('aliasButtonRemove')
    expect(buttonRemove).toBeDisabled()
  })
})
