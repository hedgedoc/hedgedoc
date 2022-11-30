/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Alias } from '../../../../api/alias/types'
import * as useApplicationStateModule from '../../../../hooks/common/use-application-state'
import { mockI18n } from '../../../markdown-renderer/test-utils/mock-i18n'
import { AliasesList } from './aliases-list'
import * as AliasesListEntryModule from './aliases-list-entry'
import type { AliasesListEntryProps } from './aliases-list-entry'
import { render } from '@testing-library/react'
import React from 'react'

jest.mock('../../../../hooks/common/use-application-state')
jest.mock('./aliases-list-entry')

describe('AliasesList', () => {
  beforeEach(async () => {
    await mockI18n()
    jest.spyOn(useApplicationStateModule, 'useApplicationState').mockReturnValue([
      {
        name: 'a-test',
        noteId: 'note-id',
        primaryAlias: false
      },
      {
        name: 'z-test',
        noteId: 'note-id',
        primaryAlias: false
      },
      {
        name: 'b-test',
        noteId: 'note-id',
        primaryAlias: true
      }
    ] as Alias[])
    jest.spyOn(AliasesListEntryModule, 'AliasesListEntry').mockImplementation((({ alias }) => {
      return (
        <span>
          Alias: {alias.name} ({alias.primaryAlias ? 'primary' : 'non-primary'})
        </span>
      )
    }) as React.FC<AliasesListEntryProps>)
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })

  it('renders the AliasList sorted', () => {
    const view = render(<AliasesList />)
    expect(view.container).toMatchSnapshot()
  })
})
