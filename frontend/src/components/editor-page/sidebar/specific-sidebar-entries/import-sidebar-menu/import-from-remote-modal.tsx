/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import { CommonModal, type ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { ExternalLink } from '../../../../common/links/external-link'
import { useChangeEditorContentCallback } from '../../../change-content-context/use-change-editor-content-callback'
import { buildAppendContentFormatter } from '../build-append-content-formatter'
import { useOnInputChange } from '../../../../../hooks/common/use-on-input-change'
import React, { useCallback, useState } from 'react'
import { Button, FormControl, FormGroup, FormLabel, FormText, Modal } from 'react-bootstrap'
import type { Icon } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { useTranslatedText } from '../../../../../hooks/common/use-translated-text'

interface ImportFromRemoteModalProps extends ModalVisibilityProps {
  icon: Icon
  serviceI18nKey: string
  urlPlaceholder: string
  tokenProvisioningUrlI18nKey: string
  buildTokenProvisioningUrl: (url: string) => string
  fetchContent: (url: string, token: string) => Promise<string>
}

/**
 * Renders a modal for importing content from a remote code snippet service.
 */
export const ImportFromRemoteModal: React.FC<ImportFromRemoteModalProps> = ({
  show,
  onHide,
  icon,
  serviceI18nKey,
  urlPlaceholder,
  tokenProvisioningUrlI18nKey,
  buildTokenProvisioningUrl,
  fetchContent
}) => {
  const { t } = useTranslation()
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
        onHide?.()
      })
      .catch(showErrorNotificationBuilder('editor.importExport.import.notificationError', { service }, true))
      .finally(() => setImporting(false))
  }, [
    changeEditorContent,
    dispatchUiNotification,
    fetchContent,
    icon,
    onHide,
    service,
    showErrorNotificationBuilder,
    token,
    url
  ])

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      title={t('editor.importExport.import.title', { service })}
      showCloseButton={true}
      titleIcon={icon}>
      <Modal.Body>
        <FormGroup className={'my-2'}>
          <FormLabel>
            <Trans i18nKey={'editor.importExport.import.url'} />
          </FormLabel>
          <FormControl value={url} onChange={changeUrl} type={'url'} placeholder={urlPlaceholder} />
        </FormGroup>
        <FormGroup className={'my-2'}>
          <FormLabel>
            <Trans i18nKey={'editor.importExport.common.accessToken'} />
          </FormLabel>
          <FormControl value={token} onChange={changeToken} type={'password'} />
          <FormText muted={true}>
            <Trans i18nKey={'editor.importExport.import.anonymousImport'} />{' '}
            <ExternalLink text={tokenProvisioningUrlText} href={buildTokenProvisioningUrl(url)} />
          </FormText>
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'success'} onClick={importSnippet} disabled={url === '' || importing || !changeEditorContent}>
          <Trans i18nKey={'editor.importExport.import.button'} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
