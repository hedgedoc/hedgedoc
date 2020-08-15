import { Editor, EditorConfiguration } from 'codemirror'
import React, { Fragment } from 'react'
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { EditorPreferences } from './editor-preferences/editor-preferences'
import { EmojiPickerButton } from './emoji-picker-button'
import './tool-bar.scss'
import {
  addCodeFences,
  addComment,
  addHeaderLevel,
  addImage,
  addLine,
  addLink,
  addList,
  addOrderedList,
  addQuotes,
  addTable,
  addTaskList,
  makeSelectionBold,
  makeSelectionItalic,
  strikeThroughSelection,
  subscriptSelection,
  superscriptSelection,
  underlineSelection
} from './utils'

export interface ToolBarProps {
  editor: Editor | undefined
  onPreferencesChange: (config: EditorConfiguration) => void
  editorPreferences: EditorConfiguration
}

export const ToolBar: React.FC<ToolBarProps> = ({ editor, onPreferencesChange, editorPreferences }) => {
  const { t } = useTranslation()

  const notImplemented = () => {
    alert('This feature is not yet implemented')
  }

  if (!editor) {
    return null
  }

  return (
    <Fragment>
      <ButtonToolbar className='bg-light'>
        <ButtonGroup className={'mx-2 flex-wrap'}>
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
        <span className={'divider'}>&nbsp;</span>
        <ButtonGroup className={'mx-2 flex-wrap'}>
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
        <span className={'divider'}>&nbsp;</span>
        <ButtonGroup className={'mx-2 flex-wrap'}>
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
        <span className={'divider'}>&nbsp;</span>
        <ButtonGroup className={'mx-2 flex-wrap'}>
          <Button variant='light' onClick={() => addTable(editor)} title={t('editor.editorToolbar.table')}>
            <ForkAwesomeIcon icon="table"/>
          </Button>
          <Button variant='light' onClick={() => addLine(editor)} title={t('editor.editorToolbar.line')}>
            <ForkAwesomeIcon icon="minus"/>
          </Button>
          <Button variant='light' onClick={() => addComment(editor)} title={t('editor.editorToolbar.comment')}>
            <ForkAwesomeIcon icon="comment"/>
          </Button>
          <EmojiPickerButton editor={editor}/>
        </ButtonGroup>
        <span className={'divider'}>&nbsp;</span>
        <ButtonGroup className={'mx-2 flex-wrap'}>
          <EditorPreferences onPreferencesChange={onPreferencesChange} preferences={editorPreferences}/>
        </ButtonGroup>
      </ButtonToolbar>
    </Fragment>
  )
}
