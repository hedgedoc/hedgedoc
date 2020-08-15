import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { DropdownItemWithDeletionModal } from '../../landing/pages/history/common/entry-menu/dropdown-item-with-deletion-modal'

export interface EditorMenuProps {
  noteTitle: string
}

export const EditorMenu: React.FC<EditorMenuProps> = ({ noteTitle }) => {
  useTranslation()

  return (
    <Dropdown className={'small mx-1'} alignRight={true}>
      <Dropdown.Toggle variant='light' size='sm' id='editor-menu'>
        <Trans i18nKey={'editor.documentBar.menu'}/>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <DropdownItemWithDeletionModal
          itemI18nKey={'landing.history.menu.deleteNote'}
          modalButtonI18nKey={'editor.modal.deleteNote.button'}
          modalIcon={'trash'}
          modalQuestionI18nKey={'editor.modal.deleteNote.question'}
          modalTitleI18nKey={'editor.modal.deleteNote.title'}
          modalWarningI18nKey={'editor.modal.deleteNote.warning'}
          noteTitle={noteTitle}
          className={'small'}
          onConfirm={() => console.log('deleted')}/>

      </Dropdown.Menu>
    </Dropdown>
  )
}
