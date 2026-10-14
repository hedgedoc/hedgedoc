/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import { ExternalLink } from '../../../../common/links/external-link'
import { useChangeEditorContentCallback } from '../../../change-content-context/use-change-editor-content-callback'
import { buildAppendContentFormatter } from '../build-append-content-formatter'
import { useOnInputChange } from '../../../../../hooks/common/use-on-input-change'
import React, { Fragment, useCallback, useState } from 'react'
import { Button, FormControl, FormGroup, FormText } from 'react-bootstrap'
import type { Icon } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'
import { SidebarMenuInfoEntry } from '../../sidebar-menu-info-entry/sidebar-menu-info-entry'

interface ImportFromRemoteMenuProps {
  icon: Icon
  serviceI18nKey: string
  urlPlaceholder: string
  tokenProvisioningUrlI18nKey: string
  buildTokenProvisioningUrl: (url: string) => string
  fetchContent: (url: string, token: string) => Promise<string>
  onImportFinished: () => void
}

/**
 * Renders a menu for importing content from a remote code snippet service.
 */
export const ImportFromRemoteMenu: React.FC<ImportFromRemoteMenuProps> = ({
  icon,
  serviceI18nKey,
  urlPlaceholder,
  tokenProvisioningUrlI18nKey,
  buildTokenProvisioningUrl,
  fetchContent,
  onImportFinished
}) => {
  const changeEditorContent = useChangeEditorContentCallback()
  const { dispatchUiNotification, showErrorNotificationBuilder } = useUiNotifications()

  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [importing, setImporting] = useState(false)

  const changeUrl = useOnInputChange(setUrl)
  const changeToken = useOnInputChange(setToken)

  const service = useTranslatedText(serviceI18nKey)
  const tokenProvisioningUrlText = useTranslatedText(tokenProvisioningUrlI18nKey)

  const importSnippet = useCallback(() => {
    setImporting(true)
    fetchContent(url, token)
      .then((content) => {
        changeEditorContent?.(buildAppendContentFormatter(content))
        dispatchUiNotification(
          'editor.importExport.import.notificationSuccessTitle',
          'editor.importExport.import.notificationSuccessMessage',
          {
            icon,
            contentI18nOptions: { service }
          }
        )
        setUrl('')
        setToken('')
        onImportFinished?.()
      })
      .catch(showErrorNotificationBuilder('editor.importExport.import.notificationError', { service }, true))
      .finally(() => setImporting(false))
  }, [
    changeEditorContent,
    dispatchUiNotification,
    fetchContent,
    icon,
    onImportFinished,
    service,
    showErrorNotificationBuilder,
    token,
    url
  ])

  return (
    <Fragment>
      <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.importExport.import.url'} border={false}>
        <FormControl value={url} onChange={changeUrl} type={'url'} placeholder={urlPlaceholder} />
      </SidebarMenuInfoEntry>
      <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.importExport.common.accessToken'} border={false}>
        <FormGroup>
          <FormControl value={token} onChange={changeToken} type={'password'} />
          <FormText muted={true}>
            <Trans i18nKey={'editor.importExport.import.anonymousImport'} />{' '}
            <ExternalLink text={tokenProvisioningUrlText} href={buildTokenProvisioningUrl(url)} />
          </FormText>
        </FormGroup>
      </SidebarMenuInfoEntry>
      <Button
        variant={'success'}
        onClick={importSnippet}
        disabled={url === '' || importing || !changeEditorContent}
        className={'mx-2 mt-2'}>
        <Trans i18nKey={'editor.importExport.import.button'} />
      </Button>
    </Fragment>
  )
}
