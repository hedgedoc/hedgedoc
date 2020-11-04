import { Picker } from 'emoji-picker-element'
import { CustomEmoji, EmojiClickEvent, EmojiClickEventDetail } from 'emoji-picker-element/shared'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useClickAway } from 'react-use'
import { ApplicationState } from '../../../../../redux'
import './emoji-picker.scss'
import forkawesomeIcon from './forkawesome.png'
import { ForkAwesomeIcons } from './icon-names'

export interface EmojiPickerProps {
  show: boolean
  onEmojiSelected: (emoji: EmojiClickEventDetail) => void
  onDismiss: () => void
}

export const customEmojis: CustomEmoji[] = Object.keys(ForkAwesomeIcons).map((name) => ({
  name: `fa-${name}`,
  shortcodes: [`fa-${name.toLowerCase()}`],
  url: forkawesomeIcon,
  category: 'ForkAwesome'
}))

export const EMOJI_DATA_PATH = '/static/js/emoji-data.json'

export const emojiPickerConfig = {
  customEmoji: customEmojis,
  dataSource: EMOJI_DATA_PATH
}

const twemojiStyle = (): HTMLStyleElement => {
  const style = document.createElement('style')
  style.textContent = 'section.picker { --font-family: "Twemoji Mozilla" !important; }'
  return style
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ show, onEmojiSelected, onDismiss }) => {
  const darkModeEnabled = useSelector((state: ApplicationState) => state.darkMode.darkMode)
  const pickerContainerRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<Picker>()

  useClickAway(pickerContainerRef, () => {
    onDismiss()
  })

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
    <div className={`position-absolute emoji-picker-container ${!show ? 'd-none' : ''}`} ref={pickerContainerRef}/>
  )
}
