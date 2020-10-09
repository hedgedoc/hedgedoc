import React from 'react'
import { useTranslation } from 'react-i18next'
import { PinToHistoryButton } from './buttons/pin-to-history-button'
import { ShareLinkButton } from './buttons/share-link-button'
import { ConnectionIndicator } from './connection-indicator/connection-indicator'
import { DocumentInfoButton } from './document-info/document-info-button'
import { EditorMenu } from './menus/editor-menu'
import { ExportMenu } from './menus/export-menu'
import { ImportMenu, ImportProps } from './menus/import-menu'
import { PermissionButton } from './permissions/permission-button'
import { RevisionButton } from './revisions/revision-button'

export interface DocumentBarProps {
  title: string
}

export const DocumentBar: React.FC<DocumentBarProps & ImportProps> = ({ title, noteContent, updateNoteContent }) => {
  useTranslation()

  return (
    <div className={'navbar navbar-expand navbar-light bg-light'}>
      <div className="navbar-nav">
        <ShareLinkButton/>
        <DocumentInfoButton/>
        <RevisionButton noteContent={noteContent}/>
        <PinToHistoryButton/>
        <PermissionButton/>
      </div>
      <div className="ml-auto navbar-nav">
        <ImportMenu updateNoteContent={updateNoteContent} noteContent={noteContent}/>
        <ExportMenu title={title} noteContent={noteContent}/>
        <EditorMenu noteTitle={title}/>
        <ConnectionIndicator/>
      </div>
    </div>
  )
}
