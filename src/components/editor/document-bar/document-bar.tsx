import React from 'react'
import { useTranslation } from 'react-i18next'
import { ConnectionIndicator } from './connection-indicator/connection-indicator'
import { DocumentInfoButton } from './document-info-button'
import { EditorMenu } from './editor-menu'
import { ExportMenu } from './export-menu'
import { ImportMenu } from './import-menu'
import { PermissionButton } from './permission-button'
import { PinToHistoryButton } from './pin-to-history-button'
import { ShareLinkButton } from './share-link-button'
import { RevisionButton } from './revision-button'

export interface DocumentBarProps {
  title: string
}

export const DocumentBar: React.FC<DocumentBarProps> = ({ title }) => {
  useTranslation()

  return (
    <div className={'navbar navbar-expand navbar-light bg-light'}>
      <div className="navbar-nav">
        <ShareLinkButton/>
        <DocumentInfoButton/>
        <RevisionButton/>
        <PinToHistoryButton/>
        <PermissionButton/>
      </div>
      <div className="ml-auto navbar-nav">
        <ImportMenu/>
        <ExportMenu/>
        <EditorMenu noteTitle={title}/>
        <ConnectionIndicator/>
      </div>
    </div>
  )
}
