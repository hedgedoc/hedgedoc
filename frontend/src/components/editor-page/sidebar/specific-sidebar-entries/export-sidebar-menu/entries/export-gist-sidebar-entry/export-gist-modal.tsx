/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react'
import type { ModalVisibilityProps } from '../../../../../../common/modals/common-modal'
import { CommonModal } from '../../../../../../common/modals/common-modal'
import { Button, FormCheck, FormControl, FormGroup, FormLabel, FormText, Modal } from 'react-bootstrap'
import { useNoteMarkdownContent } from '../../../../../../../hooks/common/use-note-markdown-content'
import { useNoteFilename } from '../../../../../../../hooks/common/use-note-filename'
import { useOnInputChange } from '../../../../../../../hooks/common/use-on-input-change'
import { Github } from 'react-bootstrap-icons'
import { useUiNotifications } from '../../../../../../notifications/ui-notification-boundary'
import { useTranslatedText } from '../../../../../../../hooks/common/use-translated-text'
import { Trans, useTranslation } from 'react-i18next'
import { ExternalLink } from '../../../../../../common/links/external-link'
import { createGist } from './create-gist'
import { validateToken } from './validate-token'

/**
 * Renders the modal for exporting the note content to a GitHub Gist.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is about to be closed.
 */
export const ExportGistModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()

  const noteContent = useNoteMarkdownContent()
  const noteFilename = useNoteFilename()

  const { dispatchUiNotification, showErrorNotification } = useUiNotifications()

  const textService = useTranslatedText('editor.export.gist.service')
  const textShortName = useTranslatedText('editor.export.gist.shortName')
  const textModalTitle = useTranslatedText('editor.export.common.title', { replace: { service: textService } })
  const textCreateButton = useTranslatedText('editor.export.common.createButton', {
    replace: { shortName: textShortName }
  })
  const textNotificationButton = useTranslatedText('editor.export.common.notificationSuccessButton', {
    replace: {
      shortName: textShortName
    }
  })
  const textFieldPublic = useTranslatedText('editor.export.gist.fieldPublic')

  const [ghToken, setGhToken] = useState('')
  const [gistDescription, setGistDescription] = useState('')
  const [gistPublic, setGistPublic] = useState(false)

  const onGistDescriptionChange = useOnInputChange(setGistDescription)
  const onGhTokenChange = useOnInputChange(setGhToken)
  const onGistPublicChange = useCallback(() => setGistPublic((prev) => !prev), [])

  const ghTokenFormatValid = useMemo(() => validateToken(ghToken), [ghToken])

  const onCreateGist = useCallback(() => {
    createGist(ghToken, noteContent, gistDescription, noteFilename, gistPublic)
      .then((gistUrl) => {
        dispatchUiNotification(
          'editor.export.common.notificationSuccessTitle',
          'editor.export.common.notificationSuccessMessage',
          {
            durationInSecond: 30,
            icon: Github,
            buttons: [{ label: textNotificationButton, onClick: () => window.open(gistUrl, '_blank') }],
            titleI18nOptions: {
              replace: { shortName: textShortName }
            },
            contentI18nOptions: {
              replace: { service: textService }
            }
          }
        )
        onHide?.()
      })
      .catch(
        showErrorNotification(
          'editor.export.common.notificationErrorTitle',
          { replace: { shortName: textShortName } },
          true
        )
      )
  }, [
    ghToken,
    noteContent,
    noteFilename,
    gistDescription,
    gistPublic,
    showErrorNotification,
    textShortName,
    dispatchUiNotification,
    textNotificationButton,
    textService,
    onHide
  ])

  return (
    <CommonModal show={show} onHide={onHide} title={textModalTitle} showCloseButton={true} titleIcon={Github}>
      <Modal.Body>
        <h5 className={'mb-2'}>
          <Trans i18nKey={'editor.export.common.headingAuthentication'} />
        </h5>
        <FormGroup className={'my-2'}>
          <FormLabel>
            <Trans i18nKey={'editor.export.common.fieldToken'} />
          </FormLabel>
          <FormControl value={ghToken} onChange={onGhTokenChange} type={'password'} isInvalid={!ghTokenFormatValid} />
          <FormText muted={true}>
            <Trans i18nKey={'editor.export.gist.infoToken'} />{' '}
            <ExternalLink
              text={'https://github.com/settings/personal-access-tokens/new'}
              href={'https://github.com/settings/personal-access-tokens/new'}
            />
          </FormText>
        </FormGroup>
        <h5 className={'mb-2 mt-4'}>
          <Trans i18nKey={'editor.export.common.headingSettings'} />
        </h5>
        <FormGroup className={'my-2'}>
          <FormLabel>
            <Trans i18nKey={'editor.export.common.fieldDescription'} />
          </FormLabel>
          <FormControl value={gistDescription} onChange={onGistDescriptionChange} type={'text'} />
        </FormGroup>
        <FormGroup className={'mt-2'}>
          <FormCheck checked={gistPublic} onChange={onGistPublicChange} type={'checkbox'} label={textFieldPublic} />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'success'} onClick={onCreateGist} disabled={!ghTokenFormatValid}>
          {textCreateButton}
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
