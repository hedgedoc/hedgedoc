/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import * as identicon from '@dicebear/identicon'
import type { UserInfoInterface } from '@hedgedoc/commons'

/**
 * Returns the correct avatar url for a user.
 * When the user has no photoUrl, a random avatar is generated from the display name.
 *
 * @param user The user for which to get the avatar URL
 * @param forceFallback Whether to force the fallback avatar even if the user has a photoUrl
 * @return The correct avatar url for the user
 */
export const useAvatarUrl = (user: UserInfoInterface, forceFallback = false): string => {
  const { photoUrl, displayName } = user

  return useMemo(() => {
    if (photoUrl && photoUrl.trim() !== '' && !forceFallback) {
      return photoUrl
    }
    const avatar = createAvatar(identicon, {
      seed: displayName
    })
    return avatar.toDataUri()
  }, [photoUrl, displayName, forceFallback])
}
