import emojiData from 'emoji-mart/data/twitter.json'
import { Data } from 'emoji-mart/dist-es/utils/data'
import { ForkAwesomeIcons } from '../../../editor/editor-pane/tool-bar/emoji-picker/icon-names'

export const markdownItTwitterEmojis = Object.keys((emojiData as unknown as Data).emojis)
  .reduce((reduceObject, emojiIdentifier) => {
    const emoji = (emojiData as unknown as Data).emojis[emojiIdentifier]
    const emojiCodes = emoji.unified ?? emoji.b
    if (emojiCodes) {
      reduceObject[emojiIdentifier] = emojiCodes.split('-').map(char => `&#x${char};`).join('')
    }
    return reduceObject
  }, {} as { [key: string]: string })

export const emojiSkinToneModifierMap = [2, 3, 4, 5, 6]
  .reduce((reduceObject, modifierValue) => {
    const lightSkinCode = 127995
    const codepoint = lightSkinCode + (modifierValue - 2)
    const shortcode = `skin-tone-${modifierValue}`
    reduceObject[shortcode] = `&#${codepoint};`
    return reduceObject
  }, {} as { [key: string]: string })

export const forkAwesomeIconMap = Object.keys(ForkAwesomeIcons)
  .reduce((reduceObject, icon) => {
    const shortcode = `fa-${icon}`
    // noinspection CheckTagEmptyBody
    reduceObject[shortcode] = `<i class="fa fa-${icon}"></i>`
    return reduceObject
  }, {} as { [key: string]: string })

export const combinedEmojiData = {
  ...markdownItTwitterEmojis,
  ...emojiSkinToneModifierMap,
  ...forkAwesomeIconMap
}
