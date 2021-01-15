/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import CodeMirror from 'codemirror'
import React, { Fragment, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { addEmoji } from '../utils/toolbarButtonUtils'
import { EmojiPicker } from './emoji-picker'

export interface EmojiPickerButtonProps {
  editor: CodeMirror.Editor
}

export const EmojiPickerButton: React.FC<EmojiPickerButtonProps> = ({ editor }) => {
  const { t } = useTranslation()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  return (
    <Fragment>
      <EmojiPicker
        show={showEmojiPicker}
        onEmojiSelected={(emoji) => {
          setShowEmojiPicker(false)
          addEmoji(emoji, editor)
        }}
        onDismiss={() => setShowEmojiPicker(false)}/>
      <Button data-cy={'show-emoji-picker'} variant='light' onClick={() => setShowEmojiPicker(old => !old)} title={t('editor.editorToolbar.emoji')}>
        <ForkAwesomeIcon icon="smile-o"/>
      </Button>
    </Fragment>
  )
}
