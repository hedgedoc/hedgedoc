/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ButtonGroup, ButtonToolbar } from 'react-bootstrap'
import { EmojiPickerButton } from './emoji-picker/emoji-picker-button'
import { TablePickerButton } from './table-picker/table-picker-button'
import styles from './tool-bar.module.scss'
import { UploadImageButton } from './upload-image-button'
import { ToolbarButton } from './toolbar-button'
import { FormatType } from '../../../../redux/note-details/types'

export const ToolBar: React.FC = () => {
  return (
    <ButtonToolbar className={`bg-light ${styles.toolbar}`}>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <ToolbarButton icon={'bold'} formatType={FormatType.BOLD} />
        <ToolbarButton icon={'italic'} formatType={FormatType.ITALIC} />
        <ToolbarButton icon={'underline'} formatType={FormatType.UNDERLINE} />
        <ToolbarButton icon={'strikethrough'} formatType={FormatType.STRIKETHROUGH} />
        <ToolbarButton icon={'subscript'} formatType={FormatType.SUBSCRIPT} />
        <ToolbarButton icon={'superscript'} formatType={FormatType.SUPERSCRIPT} />
        <ToolbarButton icon={'eraser'} formatType={FormatType.HIGHLIGHT} />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <ToolbarButton icon={'header'} formatType={FormatType.HEADER_LEVEL} />
        <ToolbarButton icon={'code'} formatType={FormatType.CODE_FENCE} />
        <ToolbarButton icon={'quote-right'} formatType={FormatType.QUOTES} />
        <ToolbarButton icon={'list'} formatType={FormatType.UNORDERED_LIST} />
        <ToolbarButton icon={'list-ol'} formatType={FormatType.ORDERED_LIST} />
        <ToolbarButton icon={'check-square'} formatType={FormatType.CHECK_LIST} />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <ToolbarButton icon={'link'} formatType={FormatType.LINK} />
        <ToolbarButton icon={'picture-o'} formatType={FormatType.IMAGE_LINK} />
        <UploadImageButton />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <TablePickerButton />
        <ToolbarButton icon={'minus'} formatType={FormatType.HORIZONTAL_LINE} />
        <ToolbarButton icon={'caret-square-o-down'} formatType={FormatType.COLLAPSIBLE_BLOCK} />
        <ToolbarButton icon={'comment'} formatType={FormatType.COMMENT} />
        <EmojiPickerButton />
      </ButtonGroup>
    </ButtonToolbar>
  )
}
