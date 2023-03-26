/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as useApplicationStateModule from '../hooks/common/use-application-state'
import type { ApplicationState } from '../redux/application-state'

jest.mock('../hooks/common/use-application-state')
export const mockNoteOwnership = (
  ownUsername: string,
  noteOwner: string,
  additionalState?: Partial<ApplicationState>
) => {
  jest.spyOn(useApplicationStateModule, 'useApplicationState').mockImplementation((fn) => {
    return fn({
      ...additionalState,
      noteDetails: {
        ...additionalState?.noteDetails,
        permissions: {
          owner: noteOwner
        }
      },
      user: {
        ...additionalState?.user,
        username: ownUsername
      }
    } as ApplicationState)
  })
}
