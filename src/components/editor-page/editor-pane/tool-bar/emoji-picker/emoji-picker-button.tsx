/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useCallback, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../../common/fork-awesome/fork-awesome-icon'
import { EmojiPicker } from './emoji-picker'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { getEmojiShortCode } from '../utils/emojiUtils'
import { replaceSelection } from '../../../../../redux/note-details/methods'
import type { EmojiClickEventDetail } from 'emoji-picker-element/shared'
import Optional from 'optional-js'

export const EmojiPickerButton: React.FC = () => {
  const { t } = useTranslation()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const onEmojiSelected = useCallback((emoji: EmojiClickEventDetail) => {
    setShowEmojiPicker(false)
    Optional.ofNullable(getEmojiShortCode(emoji)).ifPresent((shortCode) => replaceSelection(shortCode))
  }, [])
  const hidePicker = useCallback(() => setShowEmojiPicker(false), [])
  const showPicker = useCallback(() => setShowEmojiPicker(true), [])

  return (
    <Fragment>
      <EmojiPicker show={showEmojiPicker} onEmojiSelected={onEmojiSelected} onDismiss={hidePicker} />
      <Button
        {...cypressId('show-emoji-picker')}
        variant='light'
        onClick={showPicker}
        title={t('editor.editorToolbar.emoji')}>
        <ForkAwesomeIcon icon='smile-o' />
      </Button>
    </Fragment>
  )
}
