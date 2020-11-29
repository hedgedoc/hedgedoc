/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { Editor } from 'codemirror'
import React from 'react'
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { EditorPreferences } from './editor-preferences/editor-preferences'
import { EmojiPickerButton } from './emoji-picker/emoji-picker-button'
import { TablePickerButton } from './table-picker/table-picker-button'
import './tool-bar.scss'
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

export interface ToolBarProps {
  editor: Editor | undefined
}

export const ToolBar: React.FC<ToolBarProps> = ({ editor }) => {
  const { t } = useTranslation()

  const notImplemented = () => {
    alert('This feature is not yet implemented')
  }

  if (!editor) {
    return null
  }

  return (
    <ButtonToolbar className='bg-light'>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <Button variant='light' onClick={() => makeSelectionBold(editor)} title={t('editor.editorToolbar.bold')}>
          <ForkAwesomeIcon icon="bold"/>
        </Button>
        <Button variant='light' onClick={() => makeSelectionItalic(editor)} title={t('editor.editorToolbar.italic')}>
          <ForkAwesomeIcon icon="italic"/>
        </Button>
        <Button variant='light' onClick={() => underlineSelection(editor)} title={t('editor.editorToolbar.underline')}>
          <ForkAwesomeIcon icon="underline"/>
        </Button>
        <Button variant='light' onClick={() => strikeThroughSelection(editor)} title={t('editor.editorToolbar.strikethrough')}>
          <ForkAwesomeIcon icon="strikethrough"/>
        </Button>
        <Button variant='light' onClick={() => subscriptSelection(editor)} title={t('editor.editorToolbar.subscript')}>
          <ForkAwesomeIcon icon="subscript"/>
        </Button>
        <Button variant='light' onClick={() => superscriptSelection(editor)} title={t('editor.editorToolbar.superscript')}>
          <ForkAwesomeIcon icon="superscript"/>
        </Button>
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <Button variant='light' onClick={() => addHeaderLevel(editor)} title={t('editor.editorToolbar.header')}>
          <ForkAwesomeIcon icon="header"/>
        </Button>
        <Button variant='light' onClick={() => addCodeFences(editor)} title={t('editor.editorToolbar.code')}>
          <ForkAwesomeIcon icon="code"/>
        </Button>
        <Button variant='light' onClick={() => addQuotes(editor)} title={t('editor.editorToolbar.blockquote')}>
          <ForkAwesomeIcon icon="quote-right"/>
        </Button>
        <Button variant='light' onClick={() => addList(editor)} title={t('editor.editorToolbar.unorderedList')}>
          <ForkAwesomeIcon icon="list"/>
        </Button>
        <Button variant='light' onClick={() => addOrderedList(editor)} title={t('editor.editorToolbar.orderedList')}>
          <ForkAwesomeIcon icon="list-ol"/>
        </Button>
        <Button variant='light' onClick={() => addTaskList(editor)} title={t('editor.editorToolbar.checkList')}>
          <ForkAwesomeIcon icon="check-square"/>
        </Button>
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <Button variant='light' onClick={() => addLink(editor)} title={t('editor.editorToolbar.link')}>
          <ForkAwesomeIcon icon="link"/>
        </Button>
        <Button variant='light' onClick={() => addImage(editor)} title={t('editor.editorToolbar.image')}>
          <ForkAwesomeIcon icon="picture-o"/>
        </Button>
        <Button variant='light' onClick={notImplemented} title={t('editor.editorToolbar.uploadImage')}>
          <ForkAwesomeIcon icon="upload"/>
        </Button>
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <TablePickerButton editor={editor}/>
        <Button variant='light' onClick={() => addLine(editor)} title={t('editor.editorToolbar.line')}>
          <ForkAwesomeIcon icon="minus"/>
        </Button>
        <Button variant='light' onClick={() => addCollapsableBlock(editor)} title={t('editor.editorToolbar.collapsableBlock')}>
          <ForkAwesomeIcon icon="caret-square-o-down"/>
        </Button>
        <Button variant='light' onClick={() => addComment(editor)} title={t('editor.editorToolbar.comment')}>
          <ForkAwesomeIcon icon="comment"/>
        </Button>
        <EmojiPickerButton editor={editor}/>
      </ButtonGroup>
      <ButtonGroup className={'mx-1 flex-wrap'}>
        <EditorPreferences/>
      </ButtonGroup>
    </ButtonToolbar>
  )
}
