/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react'
import { createAvatar } from '@dicebear/core'
import * as identicon from '@dicebear/identicon'
import type { UserInfoDto } from '@hedgedoc/commons'

/**
 * Returns the correct avatar url for a user.
 * When the user has no photoUrl, a random avatar is generated from the display name.
 *
 * @param user The user for which to get the avatar URL
 * @return The correct avatar url for the user
 */
export const useAvatarUrl = (user: UserInfoDto): string => {
  const { photoUrl, displayName } = user

  return useMemo(() => {
    if (photoUrl && photoUrl.trim() !== '') {
      return photoUrl
    }
    const avatar = createAvatar(identicon, {
      seed: displayName
    })
    return avatar.toDataUri()
  }, [photoUrl, displayName])
}
