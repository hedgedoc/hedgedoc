/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import fontStyles from '../../../../../../global-styles/variables.module.scss'
import { useDarkModeState } from '../../../../../hooks/common/use-dark-mode-state'
import { ForkAwesomeIcons } from '../../../../common/fork-awesome/fork-awesome-icons'
import styles from './emoji-picker.module.scss'
import forkawesomeIcon from './forkawesome.png'
import { Picker } from 'emoji-picker-element'
import type { CustomEmoji, EmojiClickEvent, EmojiClickEventDetail } from 'emoji-picker-element/shared'
import React, { useEffect, useRef } from 'react'
import { Popover } from 'react-bootstrap'
import type { PopoverProps } from 'react-bootstrap/Popover'

const customEmojis: CustomEmoji[] = ForkAwesomeIcons.map((name) => ({
  name: `fa-${name}`,
  shortcodes: [`fa-${name.toLowerCase()}`],
  url: forkawesomeIcon.src,
  category: 'ForkAwesome'
}))

const EMOJI_DATA_PATH = '_next/static/js/emoji-data.json'

const emojiPickerConfig = {
  customEmoji: customEmojis,
  dataSource: EMOJI_DATA_PATH
}

const twemojiStyle = (): HTMLStyleElement => {
  const style = document.createElement('style')
  style.textContent = `section.picker { --font-family: ${fontStyles['font-family-emojis']} !important; }`
  return style
}

export interface EmojiPickerProps extends PopoverProps {
  onEmojiSelected: (emoji: EmojiClickEventDetail) => void
}

/**
 * Renders the emoji picker.
 *
 * @param show If the emoji picker should be shown
 * @param onEmojiSelected The callback, that will be called if an emoji is selected
 * @param onDismiss The callback, that will be called if the picker should be closed.
 * @external {Picker} https://www.npmjs.com/package/emoji-picker-element
 */
export const EmojiPickerPopover = React.forwardRef<HTMLDivElement, EmojiPickerProps>(
  ({ onEmojiSelected, ...props }, ref) => {
    const darkModeEnabled = useDarkModeState()
    const pickerContainerRef = useRef<HTMLDivElement>(null)
    const pickerRef = useRef<Picker>()

    useEffect(() => {
      if (!pickerContainerRef.current) {
        return
      }
      const picker = new Picker(emojiPickerConfig)
      if (picker.shadowRoot) {
        picker.shadowRoot.appendChild(twemojiStyle())
      }
      pickerContainerRef.current.appendChild(picker)

      pickerRef.current = picker
      return () => {
        picker.remove()
        pickerRef.current = undefined
      }
    }, [])

    useEffect(() => {
      if (!pickerRef.current) {
        return
      }
      const emojiClick = (event: EmojiClickEvent): void => {
        onEmojiSelected(event.detail)
      }
      const picker = pickerRef.current
      picker.addEventListener('emoji-click', emojiClick, true)
      return () => {
        picker.removeEventListener('emoji-click', emojiClick, true)
      }
    }, [onEmojiSelected])

    useEffect(() => {
      if (!pickerRef.current) {
        return
      }
      pickerRef.current.setAttribute('class', darkModeEnabled ? 'dark' : 'light')
      if (darkModeEnabled) {
        pickerRef.current.removeAttribute('style')
      } else {
        pickerRef.current.setAttribute('style', '--background: #f8f9fa')
      }
    }, [darkModeEnabled])

    return (
      <Popover {...props} ref={ref} className={styles.tooltip}>
        <Popover.Body>
          <div ref={pickerContainerRef} />
        </Popover.Body>
      </Popover>
    )
  }
)
EmojiPickerPopover.displayName = 'EmojiPickerPopover'
