import { Picker } from 'emoji-picker-element'
import { CustomEmoji, EmojiClickEvent, EmojiClickEventDetail } from 'emoji-picker-element/shared'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ show, onEmojiSelected, onDismiss }) => {
  const darkModeEnabled = useSelector((state: ApplicationState) => state.darkMode.darkMode)
  const pickerContainerRef = useRef<HTMLDivElement>(null)
  const firstOpened = useRef(false)

  useClickAway(pickerContainerRef, () => {
    onDismiss()
  })

  const emojiClickListener = useCallback((event) => {
    onEmojiSelected((event as EmojiClickEvent).detail)
  }, [onEmojiSelected])

  const twemojiStyle = useMemo(() => {
    const style = document.createElement('style')
    style.textContent = 'section.picker { --font-family: "twemoji" !important; }'
    return style
  }, [])

  useEffect(() => {
    if (!pickerContainerRef.current || firstOpened.current) {
      return
    }
    const picker = new Picker({
      customEmoji: customEmojis,
      dataSource: '/static/js/emoji-data.json'
    })
    const container = pickerContainerRef.current
    picker.addEventListener('emoji-click', emojiClickListener)
    if (picker.shadowRoot) {
      picker.shadowRoot.appendChild(twemojiStyle)
    }
    container.appendChild(picker)
    firstOpened.current = true
  }, [pickerContainerRef, emojiClickListener, darkModeEnabled, twemojiStyle])

  useEffect(() => {
    if (!pickerContainerRef.current) {
      return
    }
    const pickerDomList = pickerContainerRef.current.getElementsByTagName('emoji-picker')
    if (pickerDomList.length === 0) {
      return
    }
    const picker = pickerDomList[0]
    picker.setAttribute('class', darkModeEnabled ? 'dark' : 'light')
    if (darkModeEnabled) {
      picker.removeAttribute('style')
    } else {
      picker.setAttribute('style', '--background: #f8f9fa')
    }
  }, [darkModeEnabled, pickerContainerRef, firstOpened])

  // noinspection CheckTagEmptyBody
  return (
    <div className={`position-absolute emoji-picker-container ${!show ? 'd-none' : ''}`} ref={pickerContainerRef}></div>
  )
}
