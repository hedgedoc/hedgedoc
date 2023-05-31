/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useChangeEditorContentCallback } from '../../../change-content-context/use-change-editor-content-callback'
import { replaceSelection } from '../formatters/replace-selection'
import { ToolbarButton } from '../toolbar-button'
import { EmojiPickerPopover } from './emoji-picker-popover'
import styles from './emoji-picker.module.scss'
import { extractEmojiShortCode } from './extract-emoji-short-code'
import type { EmojiClickEventDetail } from 'emoji-picker-element/shared'
import React, { Fragment, useCallback, useRef, useState } from 'react'
import { Overlay } from 'react-bootstrap'
import { EmojiSmile as IconEmojiSmile } from 'react-bootstrap-icons'
import type { OverlayInjectedProps } from 'react-bootstrap/Overlay'

/**
 * Renders a button to open the emoji picker.
 * @see EmojiPickerPopover
 */
export const EmojiPickerButton: React.FC = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const changeEditorContent = useChangeEditorContentCallback()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const onEmojiSelected = useCallback(
    (emojiClickEvent: EmojiClickEventDetail) => {
      setShowEmojiPicker(false)
      const shortCode = extractEmojiShortCode(emojiClickEvent)
      if (shortCode) {
        changeEditorContent?.(({ currentSelection }) => replaceSelection(currentSelection, shortCode, false))
      }
    },
    [changeEditorContent]
  )
  const hidePicker = useCallback(() => setShowEmojiPicker(false), [])
  const showPicker = useCallback(() => setShowEmojiPicker(true), [])

  const createPopoverElement = useCallback<(props: OverlayInjectedProps) => React.ReactElement>(
    (props) => <EmojiPickerPopover {...props} className={styles.tooltip} onEmojiSelected={onEmojiSelected} />,
    [onEmojiSelected]
  )

  return (
    <Fragment>
      <Overlay
        show={showEmojiPicker}
        onHide={hidePicker}
        placement={'auto'}
        flip={true}
        target={buttonRef.current}
        rootClose={true}
        offset={[0, 0]}>
        {createPopoverElement}
      </Overlay>
      <ToolbarButton i18nKey={'emoji'} icon={IconEmojiSmile} onClick={showPicker} buttonRef={buttonRef}></ToolbarButton>
    </Fragment>
  )
}

export default EmojiPickerButton
