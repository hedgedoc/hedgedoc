/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { mockI18n } from '../../../../../../test-utils/mock-i18n'
import { AliasesList } from './aliases-list'
import type { AliasesListEntryProps } from './aliases-list-entry'
import * as AliasesListEntryModule from './aliases-list-entry'
import { render } from '@testing-library/react'
import React from 'react'
import { mockAppState } from '../../../../../../test-utils/mock-app-state'

jest.mock('../../../../../../hooks/common/use-application-state')
jest.mock('./aliases-list-entry')

describe('AliasesList', () => {
  beforeEach(async () => {
    await mockI18n()
    const primaryAlias = 'a-test'
    mockAppState({
      noteDetails: {
        aliases: ['a-test', 'b-test', 'z-test'],
        primaryAlias: primaryAlias
      }
    })
    jest.spyOn(AliasesListEntryModule, 'AliasesListEntry').mockImplementation((({ alias }) => {
      return (
        <span>
          Alias: {alias} ({alias === primaryAlias ? 'primary' : 'non-primary'})
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
