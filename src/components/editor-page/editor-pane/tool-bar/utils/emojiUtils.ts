/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { EmojiClickEventDetail, NativeEmoji } from 'emoji-picker-element/shared'

export const getEmojiIcon = (emoji: EmojiClickEventDetail): string => {
  if (emoji.unicode) {
    return emoji.unicode
  }
  if (emoji.name) {
    // noinspection CheckTagEmptyBody
    return `<i class="fa ${emoji.name}"></i>`
  }
  return ''
}

export const getEmojiShortCode = (emoji: EmojiClickEventDetail): string | undefined => {
  if (!emoji.emoji.shortcodes) {
    return undefined
  }
  let skinToneModifier = ''
  if ((emoji.emoji as NativeEmoji).skins && emoji.skinTone !== 0) {
    skinToneModifier = `:skin-tone-${emoji.skinTone as number}:`
  }
  return `:${emoji.emoji.shortcodes[0]}:${skinToneModifier}`
}
