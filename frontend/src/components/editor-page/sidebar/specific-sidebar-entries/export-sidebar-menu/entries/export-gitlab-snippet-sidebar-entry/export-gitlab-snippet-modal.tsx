/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react'
import type { ModalVisibilityProps } from '../../../../../../common/modals/common-modal'
import { CommonModal } from '../../../../../../common/modals/common-modal'
import { Trans, useTranslation } from 'react-i18next'
import { useTranslatedText } from '../../../../../../../hooks/common/use-translated-text'
import { IconGitlab } from '../../../../../../common/icons/additional/icon-gitlab'
import { useOnInputChange } from '../../../../../../../hooks/common/use-on-input-change'
import { Button, FormControl, FormGroup, FormLabel, FormText, Modal } from 'react-bootstrap'
import { ExternalLink } from '../../../../../../common/links/external-link'
import { useNoteMarkdownContent } from '../../../../../../../hooks/common/use-note-markdown-content'
import { useNoteFilename } from '../../../../../../../hooks/common/use-note-filename'
import { useUiNotifications } from '../../../../../../notifications/ui-notification-boundary'
import { createSnippet, GitlabSnippetVisibility } from './create-snippet'
import { Github } from 'react-bootstrap-icons'
import { useNoteTitle } from '../../../../../../../hooks/common/use-note-title'

/**
 * Renders the modal for exporting the note content to a GitLab snippet.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is about to be closed.
 */
export const ExportGitlabSnippetModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()

  const noteContent = useNoteMarkdownContent()
  const noteFilename = useNoteFilename()
  const noteTitle = useNoteTitle()

  const { dispatchUiNotification, showErrorNotification } = useUiNotifications()

  const [gitlabUrl, setGitlabUrl] = useState<string>('')
  const [gitlabToken, setGitlabToken] = useState<string>('')
  const [snippetVisibility, setSnippetVisibility] = useState<GitlabSnippetVisibility>(GitlabSnippetVisibility.PRIVATE)
  const [snippetDescription, setSnippetDescription] = useState<string>('')

  const textService = useTranslatedText('editor.export.gitlab.service')
  const textShortName = useTranslatedText('editor.export.gitlab.shortName')
  const textModalTitle = useTranslatedText('editor.export.common.title', { replace: { service: textService } })
  const textTokenLink = useTranslatedText('editor.export.gitlab.infoTokenLink')
  const textCreateButton = useTranslatedText('editor.export.common.createButton', {
    replace: { shortName: textShortName }
  })
  const textNotificationButton = useTranslatedText('editor.export.common.notificationSuccessButton', {
    replace: {
      shortName: textShortName
    }
  })

  const changeGitlabUrl = useOnInputChange(setGitlabUrl)
  const changeGitlabToken = useOnInputChange(setGitlabToken)
  const changeSnippetVisibility = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSnippetVisibility(event.target.value as GitlabSnippetVisibility)
  }, [])
  const changeSnippetDescription = useOnInputChange(setSnippetDescription)

  const creationPossible = useMemo(() => {
    return gitlabUrl !== '' && gitlabToken !== ''
  }, [gitlabUrl, gitlabToken])

  const onCreateSnippet = useCallback(() => {
    createSnippet(gitlabUrl, gitlabToken, noteContent, noteTitle, snippetDescription, noteFilename, snippetVisibility)
      .then((snippetUrl) => {
        dispatchUiNotification(
          'editor.export.common.notificationSuccessTitle',
          'editor.export.common.notificationSuccessMessage',
          {
            durationInSecond: 30,
            icon: Github,
            buttons: [{ label: textNotificationButton, onClick: () => window.open(snippetUrl, '_blank') }],
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
    gitlabUrl,
    gitlabToken,
    noteContent,
    noteTitle,
    snippetDescription,
    noteFilename,
    snippetVisibility,
    showErrorNotification,
    textShortName,
    dispatchUiNotification,
    textNotificationButton,
    textService,
    onHide
  ])

  return (
    <CommonModal show={show} onHide={onHide} title={textModalTitle} showCloseButton={true} titleIcon={IconGitlab}>
      <Modal.Body>
        <h5 className={'mb-2'}>
          <Trans i18nKey={'editor.export.common.headingAuthentication'} />
        </h5>
        <FormGroup className={'my-2'}>
          <FormLabel>
            <Trans i18nKey={'editor.export.gitlab.fieldUrl'} />
          </FormLabel>
          <FormControl value={gitlabUrl} onChange={changeGitlabUrl} type={'url'} placeholder={'https://gitlab.com'} />
        </FormGroup>
        <FormGroup className={'my-2'}>
          <FormLabel>
            <Trans i18nKey={'editor.export.common.fieldToken'} />
          </FormLabel>
          <FormControl
            value={gitlabToken}
            onChange={changeGitlabToken}
            type={'password'}
            isInvalid={gitlabToken === ''}
          />
          <FormText muted={true}>
            <Trans i18nKey={'editor.export.gitlab.infoToken'} />{' '}
            <ExternalLink
              text={textTokenLink}
              href={`${gitlabUrl ?? 'https://gitlab.com'}/-/user_settings/personal_access_tokens?name=HedgeDoc+snippet+export&scopes=api`}
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
          <FormControl value={snippetDescription} onChange={changeSnippetDescription} type={'text'} />
        </FormGroup>
        <FormGroup className={'mt-2'}>
          <FormLabel>
            <Trans i18nKey={'editor.export.gitlab.fieldVisibility'} />
          </FormLabel>
          <FormControl as={'select'} value={snippetVisibility} onChange={changeSnippetVisibility}>
            <option value={GitlabSnippetVisibility.PRIVATE}>
              <Trans i18nKey={'editor.export.gitlab.visibility.private'} />
            </option>
            <option value={GitlabSnippetVisibility.INTERNAL}>
              <Trans i18nKey={'editor.export.gitlab.visibility.internal'} />
            </option>
            <option value={GitlabSnippetVisibility.PUBLIC}>
              <Trans i18nKey={'editor.export.gitlab.visibility.public'} />
            </option>
          </FormControl>
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'success'} onClick={onCreateSnippet} disabled={!creationPossible}>
          {textCreateButton}
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
