/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import * as identicon from '@dicebear/identicon'

/**
 * Returns the correct avatar url for a user.
 * When an empty or no photoUrl is given, a random avatar is generated from the displayName.
 *
 * @param photoUrl The photo url of the user to use. Maybe empty or not set.
 * @param username The username of the user to use as input to the random avatar.
 * @return The correct avatar url for the user.
 */
export const useAvatarUrl = (photoUrl: string | undefined, username: string): string => {
  return useMemo(() => {
    if (photoUrl && photoUrl.trim() !== '') {
      return photoUrl
    }
    const avatar = createAvatar(identicon, {
      seed: username
    })
    return avatar.toDataUri()
  }, [photoUrl, username])
}
