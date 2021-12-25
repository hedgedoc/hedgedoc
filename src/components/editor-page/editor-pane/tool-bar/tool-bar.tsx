/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor } from 'codemirror'
import React from 'react'
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { EditorPreferences } from './editor-preferences/editor-preferences'
import { EmojiPickerButton } from './emoji-picker/emoji-picker-button'
import { TablePickerButton } from './table-picker/table-picker-button'
import styles from './tool-bar.module.scss'
import { UploadImageButton } from './upload-image-button'
import {
  addCodeFences,
  addCollapsableBlock,
  addComment,
  addHeaderLevel,
  addImage,
  addLine,
  addLink,
  addList,
  addOrderedList,
  addQuotes,
  addTaskList,
  makeSelectionBold,
  makeSelectionItalic,
  strikeThroughSelection,
  subscriptSelection,
  superscriptSelection,
  underlineSelection
} from './utils/toolbarButtonUtils'
import { cypressId } from '../../../../utils/cypress-attribute'

export interface ToolBarProps {
  editor?: Editor
}

export const ToolBar: React.FC<ToolBarProps> = ({ editor }) => {
  const { t } = useTranslation()

  if (!editor) {
    return null
  }

  return (
    <ButtonToolbar className={`bg-light ${styles.toolbar}`}>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <Button
          {...cypressId('format-bold')}
          variant='light'
          onClick={() => makeSelectionBold(editor)}
          title={t('editor.editorToolbar.bold')}>
          <ForkAwesomeIcon icon='bold' />
        </Button>
        <Button
          {...cypressId('format-italic')}
          variant='light'
          onClick={() => makeSelectionItalic(editor)}
          title={t('editor.editorToolbar.italic')}>
          <ForkAwesomeIcon icon='italic' />
        </Button>
        <Button
          {...cypressId('format-underline')}
          variant='light'
          onClick={() => underlineSelection(editor)}
          title={t('editor.editorToolbar.underline')}>
          <ForkAwesomeIcon icon='underline' />
        </Button>
        <Button
          {...cypressId('format-strikethrough')}
          variant='light'
          onClick={() => strikeThroughSelection(editor)}
          title={t('editor.editorToolbar.strikethrough')}>
          <ForkAwesomeIcon icon='strikethrough' />
        </Button>
        <Button
          {...cypressId('format-subscript')}
          variant='light'
          onClick={() => subscriptSelection(editor)}
          title={t('editor.editorToolbar.subscript')}>
          <ForkAwesomeIcon icon='subscript' />
        </Button>
        <Button
          {...cypressId('format-superscript')}
          variant='light'
          onClick={() => superscriptSelection(editor)}
          title={t('editor.editorToolbar.superscript')}>
          <ForkAwesomeIcon icon='superscript' />
        </Button>
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <Button
          {...cypressId('format-heading')}
          variant='light'
          onClick={() => addHeaderLevel(editor)}
          title={t('editor.editorToolbar.header')}>
          <ForkAwesomeIcon icon='header' />
        </Button>
        <Button
          {...cypressId('format-code-block')}
          variant='light'
          onClick={() => addCodeFences(editor)}
          title={t('editor.editorToolbar.code')}>
          <ForkAwesomeIcon icon='code' />
        </Button>
        <Button
          {...cypressId('format-block-quote')}
          variant='light'
          onClick={() => addQuotes(editor)}
          title={t('editor.editorToolbar.blockquote')}>
          <ForkAwesomeIcon icon='quote-right' />
        </Button>
        <Button
          {...cypressId('format-unordered-list')}
          variant='light'
          onClick={() => addList(editor)}
          title={t('editor.editorToolbar.unorderedList')}>
          <ForkAwesomeIcon icon='list' />
        </Button>
        <Button
          {...cypressId('format-ordered-list')}
          variant='light'
          onClick={() => addOrderedList(editor)}
          title={t('editor.editorToolbar.orderedList')}>
          <ForkAwesomeIcon icon='list-ol' />
        </Button>
        <Button
          {...cypressId('format-check-list')}
          variant='light'
          onClick={() => addTaskList(editor)}
          title={t('editor.editorToolbar.checkList')}>
          <ForkAwesomeIcon icon='check-square' />
        </Button>
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <Button
          {...cypressId('format-link')}
          variant='light'
          onClick={() => addLink(editor)}
          title={t('editor.editorToolbar.link')}>
          <ForkAwesomeIcon icon='link' />
        </Button>
        <Button
          {...cypressId('format-image')}
          variant='light'
          onClick={() => addImage(editor)}
          title={t('editor.editorToolbar.image')}>
          <ForkAwesomeIcon icon='picture-o' />
        </Button>
        <UploadImageButton editor={editor} />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <TablePickerButton editor={editor} />
        <Button
          {...cypressId('format-add-line')}
          variant='light'
          onClick={() => addLine(editor)}
          title={t('editor.editorToolbar.line')}>
          <ForkAwesomeIcon icon='minus' />
        </Button>
        <Button
          {...cypressId('format-collapsable-block')}
          variant='light'
          onClick={() => addCollapsableBlock(editor)}
          title={t('editor.editorToolbar.collapsableBlock')}>
          <ForkAwesomeIcon icon='caret-square-o-down' />
        </Button>
        <Button
          {...cypressId('format-add-comment')}
          variant='light'
          onClick={() => addComment(editor)}
          title={t('editor.editorToolbar.comment')}>
          <ForkAwesomeIcon icon='comment' />
        </Button>
        <EmojiPickerButton editor={editor} />
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <EditorPreferences />
      </ButtonGroup>
    </ButtonToolbar>
  )
}
