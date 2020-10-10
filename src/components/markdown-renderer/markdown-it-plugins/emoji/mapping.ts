import { ForkAwesomeIcons } from '../../../editor/editor-pane/tool-bar/emoji-picker/icon-names'
import emojiData from 'emojibase-data/en/compact.json'

interface EmojiEntry {
  shortcodes: string[]
  unicode: string
}

type ShortCodeMap = { [key: string]: string }

const shortCodeMap = (emojiData as unknown as EmojiEntry[])
  .reduce((reduceObject, emoji) => {
    emoji.shortcodes.forEach(shortcode => {
      reduceObject[shortcode] = emoji.unicode
    })
    return reduceObject
  }, {} as ShortCodeMap)

const emojiSkinToneModifierMap = [1, 2, 3, 4, 5]
  .reduce((reduceObject, modifierValue) => {
    const lightSkinCode = 127995
    const codepoint = lightSkinCode + (modifierValue - 1)
    const shortcode = `skin-tone-${modifierValue}`
    reduceObject[shortcode] = `&#${codepoint};`
    return reduceObject
  }, {} as ShortCodeMap)

const forkAwesomeIconMap = Object.keys(ForkAwesomeIcons)
  .reduce((reduceObject, icon) => {
    const shortcode = `fa-${icon}`
    // noinspection CheckTagEmptyBody
    reduceObject[shortcode] = `<i class="fa fa-${icon}"></i>`
    return reduceObject
  }, {} as ShortCodeMap)

export const combinedEmojiData = {
  ...shortCodeMap,
  ...emojiSkinToneModifierMap,
  ...forkAwesomeIconMap
}
