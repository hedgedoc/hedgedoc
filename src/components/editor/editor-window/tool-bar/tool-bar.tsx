import React from 'react'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import { Positions } from '../interfaces'
import './tool-bar.scss'
import { addCodeFences, addHeaderLevel, addLink, addMarkup, addQuotes, createList, replaceSelection } from './utils'

export interface ToolBarProps {
  content: string
  onContentChange: (content: string) => void
  positions: Positions
}

export const ToolBar: React.FC<ToolBarProps> = ({ content, positions, onContentChange }) => {
  const { t } = useTranslation()
  const notImplemented = () => {
    alert('This feature is not yet implemented')
  }

  const makeSelectionBold = () => addMarkup(content, positions.startPosition, positions.endPosition, onContentChange, '**')
  const makeSelectionItalic = () => addMarkup(content, positions.startPosition, positions.endPosition, onContentChange, '*')
  const strikeThroughSelection = () => addMarkup(content, positions.startPosition, positions.endPosition, onContentChange, '~~')

  const addList = () => createList(content, positions.startPosition, positions.endPosition, onContentChange, () => '-')
  const addOrderedList = () => createList(content, positions.startPosition, positions.endPosition, onContentChange, j => `${j}.`)
  const addTaskList = () => createList(content, positions.startPosition, positions.endPosition, onContentChange, () => '- [ ]')

  const addLine = () => replaceSelection(content, positions.startPosition, positions.endPosition, onContentChange, '----')
  const addComment = () => replaceSelection(content, positions.startPosition, positions.endPosition, onContentChange, '> []')
  const addTable = () => replaceSelection(content, positions.startPosition, positions.endPosition, onContentChange, '| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |')

  return (
    <ButtonToolbar className='flex-nowrap bg-light'>
      <Button variant='light' onClick={makeSelectionBold} title={t('editor.editorToolbar.bold')}>
        <ForkAwesomeIcon icon="bold"/>
      </Button>
      <Button variant='light' onClick={makeSelectionItalic} title={t('editor.editorToolbar.italic')}>
        <ForkAwesomeIcon icon="italic"/>
      </Button>
      <Button variant='light' onClick={strikeThroughSelection} title={t('editor.editorToolbar.strikethrough')}>
        <ForkAwesomeIcon icon="strikethrough"/>
      </Button>
      <Button variant='light' onClick={() => addHeaderLevel(content, positions.startPosition, onContentChange)} title={t('editor.editorToolbar.header')}>
        <ForkAwesomeIcon icon="header"/>
      </Button>
      <Button variant='light' onClick={() => addCodeFences(content, positions.startPosition, positions.endPosition, onContentChange)} title={t('editor.editorToolbar.code')}>
        <ForkAwesomeIcon icon="code"/>
      </Button>
      <Button variant='light' onClick={() => addQuotes(content, positions.startPosition, positions.endPosition, onContentChange)} title={t('editor.editorToolbar.blockquote')}>
        <ForkAwesomeIcon icon="quote-right"/>
      </Button>
      <Button variant='light' onClick={addList} title={t('editor.editorToolbar.unorderedList')}>
        <ForkAwesomeIcon icon="list"/>
      </Button>
      <Button variant='light' onClick={addOrderedList} title={t('editor.editorToolbar.orderedList')}>
        <ForkAwesomeIcon icon="list-ol"/>
      </Button>
      <Button variant='light' onClick={addTaskList} title={t('editor.editorToolbar.checkList')}>
        <ForkAwesomeIcon icon="check-square"/>
      </Button>
      <Button variant='light' onClick={() => addLink(content, positions.startPosition, positions.endPosition, onContentChange)} title={t('editor.editorToolbar.link')}>
        <ForkAwesomeIcon icon="link"/>
      </Button>
      <Button variant='light' onClick={() => addLink(content, positions.startPosition, positions.endPosition, onContentChange, '!')} title={t('editor.editorToolbar.image')}>
        <ForkAwesomeIcon icon="picture-o"/>
      </Button>
      <Button variant='light' onClick={notImplemented} title={t('editor.editorToolbar.uploadImage')}>
        <ForkAwesomeIcon icon="upload"/>
      </Button>
      <Button variant='light' onClick={addTable} title={t('editor.editorToolbar.table')}>
        <ForkAwesomeIcon icon="table"/>
      </Button>
      <Button variant='light' onClick={addLine} title={t('editor.editorToolbar.line')}>
        <ForkAwesomeIcon icon="minus"/>
      </Button>
      <Button variant='light' onClick={addComment} title={t('editor.editorToolbar.comment')}>
        <ForkAwesomeIcon icon="comment"/>
      </Button>
    </ButtonToolbar>
  )
}
