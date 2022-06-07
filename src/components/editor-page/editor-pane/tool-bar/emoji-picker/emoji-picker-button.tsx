/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { EmojiPicker } from './emoji-picker'
import { cypressId } from '../../../../../utils/cypress-attribute'
import type { EmojiClickEventDetail } from 'emoji-picker-element/shared'
import Optional from 'optional-js'
import { useChangeEditorContentCallback } from '../../../change-content-context/use-change-editor-content-callback'
import { replaceSelection } from '../formatters/replace-selection'
import { extractEmojiShortCode } from './extract-emoji-short-code'

export const EmojiPickerButton: React.FC = () => {
  const { t } = useTranslation()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const changeEditorContent = useChangeEditorContentCallback()

  const onEmojiSelected = useCallback(
    (emojiClickEvent: EmojiClickEventDetail) => {
      setShowEmojiPicker(false)
      Optional.ofNullable(extractEmojiShortCode(emojiClickEvent)).ifPresent((shortCode) => {
        changeEditorContent?.(({ currentSelection }) => replaceSelection(currentSelection, shortCode, false))
      })
    },
    [changeEditorContent]
  )
  const hidePicker = useCallback(() => setShowEmojiPicker(false), [])
  const showPicker = useCallback(() => setShowEmojiPicker(true), [])

  return (
    <Fragment>
      <EmojiPicker show={showEmojiPicker} onEmojiSelected={onEmojiSelected} onDismiss={hidePicker} />
      <Button
        {...cypressId('show-emoji-picker')}
        variant='light'
        onClick={showPicker}
        title={t('editor.editorToolbar.emoji')}
        disabled={!changeEditorContent}>
        <ForkAwesomeIcon icon='smile-o' />
      </Button>
    </Fragment>
  )
}

export default EmojiPickerButton
