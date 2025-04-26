/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../../../test-utils/mock-i18n'
import { mockNotePermissions } from '../../../../../../test-utils/mock-note-permissions'
import { AliasesListEntry } from './aliases-list-entry'
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { mockUiNotifications } from '../../../../../../test-utils/mock-ui-notifications'
import type { AliasDto } from '@hedgedoc/commons'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import { vi } from 'vitest'

const { updateMetadata, markAliasAsPrimary, deleteAlias } = vi.hoisted(() => ({
  deleteAlias: vi.fn(() => Promise.resolve()),
  markAliasAsPrimary: vi.fn(() => Promise.resolve({ name: 'mock', primaryAlias: true, noteId: 'mock' })),
  updateMetadata: vi.fn(() => Promise.resolve())
}))

vi.mock('../../../../../../api/alias', () => ({
  deleteAlias,
  markAliasAsPrimary
}))
vi.mock('../../../../../../redux/note-details/methods', () => ({
  updateMetadata
}))
vi.mock('../../../../../notifications/ui-notification-boundary', () => ({
  useUiNotifications: vi.fn(() => ({ showErrorNotification: vi.fn() }))
}))
vi.mock('../../../../../../hooks/common/use-application-state')

describe('AliasesListEntry', () => {
  beforeEach(async () => {
    await mockI18n()
    mockUiNotifications()
  })

  afterEach(() => {
    vitest.resetAllMocks()
    vitest.resetModules()
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
    expect(deleteAlias).toBeCalledWith(testAlias.name)
    expect(updateMetadata).toBeCalled()
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
    expect(deleteAlias).toBeCalledWith(testAlias.name)
    expect(updateMetadata).toBeCalled()
    const buttonMakePrimary = await screen.findByTestId('aliasButtonMakePrimary')
    await act<void>(() => {
      buttonMakePrimary.click()
    })
    expect(markAliasAsPrimary).toBeCalledWith(testAlias.name)
    expect(updateMetadata).toBeCalled()
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
