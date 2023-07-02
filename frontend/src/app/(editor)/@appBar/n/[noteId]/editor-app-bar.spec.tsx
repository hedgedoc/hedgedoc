/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as UseApplicationStateModule from '../../../../../hooks/common/use-application-state'
import type { ApplicationState } from '../../../../../redux/application-state'
import { mockI18n } from '../../../../../test-utils/mock-i18n'
import { EditorAppBar } from './editor-app-bar'
import type { NoteGroupPermissionEntry, NoteUserPermissionEntry } from '@hedgedoc/commons'
import { render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import React from 'react'

jest.mock('../../../../../components/layout/app-bar/base-app-bar', () => ({
  __esModule: true,
  BaseAppBar: ({ children }: PropsWithChildren) => (
    <div>
      <span>first part</span>
      <div>{children}</div>
      <span>last part</span>
    </div>
  )
}))
jest.mock('../../../../../hooks/common/use-application-state')

const mockedCommonAppState = {
  noteDetails: {
    title: 'Note Title Test',
    permissions: {
      owner: 'test',
      sharedToGroups: [
        {
          groupName: '_EVERYONE',
          canEdit: false
        }
      ] as NoteGroupPermissionEntry[],
      sharedToUsers: [] as NoteUserPermissionEntry[]
    }
  },
  user: {
    username: 'test'
  }
}

describe('app bar', () => {
  beforeAll(mockI18n)
  afterAll(() => jest.restoreAllMocks())

  it('contains note title when editor is synced', () => {
    jest.spyOn(UseApplicationStateModule, 'useApplicationState').mockImplementation((fn) => {
      return fn({
        ...mockedCommonAppState,
        realtimeStatus: {
          isSynced: true
        }
      } as ApplicationState)
    })
    const view = render(<EditorAppBar />)
    expect(view.container).toMatchSnapshot()
  })

  it('contains alert when editor is not synced', () => {
    jest.spyOn(UseApplicationStateModule, 'useApplicationState').mockImplementation((fn) => {
      return fn({
        ...mockedCommonAppState,
        realtimeStatus: {
          isSynced: false
        }
      } as ApplicationState)
    })
    const view = render(<EditorAppBar />)
    expect(view.container).toMatchSnapshot()
  })

  it('contains note title and read-only marker when having only read permissions', () => {
    jest.spyOn(UseApplicationStateModule, 'useApplicationState').mockImplementation((fn) => {
      return fn({
        ...mockedCommonAppState,
        realtimeStatus: {
          isSynced: true
        },
        user: null
      } as ApplicationState)
    })
    const view = render(<EditorAppBar />)
    expect(view.container).toMatchSnapshot()
  })
})
