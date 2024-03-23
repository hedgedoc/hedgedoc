/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RevisionDetails } from '../../../../../../api/revisions/types'
import { getUserInfo } from '../../../../../../api/users'
import type { UserInfo } from '../../../../../../api/users/types'
import { download } from '../../../../../common/download/download'

const DISPLAY_MAX_USERS_PER_REVISION = 9

/**
 * Downloads a given revision's content as markdown document in the browser.
 *
 * @param noteId The id of the note from which to download the revision.
 * @param revision The revision details object containing the content to download.
 */
export const downloadRevision = (noteId: string, revision: RevisionDetails | null): void => {
  if (!revision) {
    return
  }
  download(revision.content, `${noteId}-${revision.createdAt}.md`, 'text/markdown')
}

/**
 * Fetches user details for the given usernames while returning a maximum of 9 users.
 *
 * @param usernames The list of usernames to fetch.
 * @throws {Error} in case the user-data request failed.
 * @return An array of user details.
 */
export const getUserDataForRevision = async (usernames: string[]): Promise<UserInfo[]> => {
  const users: UserInfo[] = []
  const usersToFetch = Math.min(usernames.length, DISPLAY_MAX_USERS_PER_REVISION) - 1
  for (let i = 0; i <= usersToFetch; i++) {
    const user = await getUserInfo(usernames[i])
    users.push(user)
  }
  return users
}
