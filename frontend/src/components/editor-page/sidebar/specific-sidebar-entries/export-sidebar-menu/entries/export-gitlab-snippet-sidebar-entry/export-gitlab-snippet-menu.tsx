/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useTranslatedText } from '../../../../../../../hooks/common/use-translated-text'
import { useOnInputChange } from '../../../../../../../hooks/common/use-on-input-change'
import { Button, FormControl, FormGroup, FormText } from 'react-bootstrap'
import { ExternalLink } from '../../../../../../common/links/external-link'
import { useNoteMarkdownContent } from '../../../../../../../hooks/common/use-note-markdown-content'
import { useNoteFilename } from '../../../../../../../hooks/common/use-note-filename'
import { useUiNotifications } from '../../../../../../notifications/ui-notification-boundary'
import { createSnippet, GitlabSnippetVisibility } from './create-snippet'
import { Github } from 'react-bootstrap-icons'
import { useNoteTitle } from '../../../../../../../hooks/common/use-note-title'
import { SidebarMenuInfoEntry } from '../../../../sidebar-menu-info-entry/sidebar-menu-info-entry'

export interface ExportGistMenuProps {
  onExportFinished: () => void
}

/**
 * Renders the menu for exporting the note content to a GitLab snippet.
 *
 * @param onExportFinished The callback to call after the export has finished
 */
export const ExportGitlabSnippetMenu: React.FC<ExportGistMenuProps> = ({ onExportFinished }) => {
  useTranslation()

  const noteContent = useNoteMarkdownContent()
  const noteFilename = useNoteFilename()
  const noteTitle = useNoteTitle()

  const { dispatchUiNotification, showErrorNotificationBuilder } = useUiNotifications()

  const [gitlabUrl, setGitlabUrl] = useState<string>('')
  const [gitlabToken, setGitlabToken] = useState<string>('')
  const [snippetVisibility, setSnippetVisibility] = useState<GitlabSnippetVisibility>(GitlabSnippetVisibility.PRIVATE)
  const [snippetDescription, setSnippetDescription] = useState<string>('')

  const textService = useTranslatedText('editor.importExport.service.gitlab.name')
  const textShortName = useTranslatedText('editor.importExport.service.gitlab.shortName')
  const textTokenLink = useTranslatedText('editor.importExport.service.gitlab.tokenLink')
  const textCreateButton = useTranslatedText('editor.importExport.export.createButton', {
    replace: { shortName: textShortName }
  })
  const textNotificationButton = useTranslatedText('editor.importExport.export.notificationSuccessButton', {
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
          'editor.importExport.export.notificationSuccessTitle',
          'editor.importExport.export.notificationSuccessMessage',
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
        onExportFinished?.()
      })
      .catch(
        showErrorNotificationBuilder(
          'editor.importExport.export.notificationErrorTitle',
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
    showErrorNotificationBuilder,
    textShortName,
    dispatchUiNotification,
    textNotificationButton,
    textService,
    onExportFinished
  ])

  return (
    <Fragment>
      <SidebarMenuInfoEntry titleI18nKey={'editor.importExport.service.gitlab.instanceUrl'} border={false}>
        <FormControl value={gitlabUrl} onChange={changeGitlabUrl} type={'url'} placeholder={'https://gitlab.com'} />
      </SidebarMenuInfoEntry>
      <SidebarMenuInfoEntry titleI18nKey={'editor.importExport.common.accessToken'} border={false}>
        <FormGroup className={'my-2'}>
          <FormControl
            value={gitlabToken}
            onChange={changeGitlabToken}
            type={'password'}
            isInvalid={gitlabToken === ''}
          />
          <FormText muted={true}>
            <Trans i18nKey={'editor.importExport.service.gitlab.infoToken'} />{' '}
            <ExternalLink
              text={textTokenLink}
              href={`${gitlabUrl ?? 'https://gitlab.com'}/-/user_settings/personal_access_tokens?name=HedgeDoc+snippet+export&scopes=api`}
            />
          </FormText>
        </FormGroup>
      </SidebarMenuInfoEntry>
      <SidebarMenuInfoEntry titleI18nKey={'editor.importExport.common.description'} border={false}>
        <FormControl value={snippetDescription} onChange={changeSnippetDescription} type={'text'} />
      </SidebarMenuInfoEntry>
      <SidebarMenuInfoEntry titleI18nKey={'editor.importExport.service.gitlab.setVisibility'} border={false}>
        <FormControl as={'select'} value={snippetVisibility} onChange={changeSnippetVisibility}>
          <option value={GitlabSnippetVisibility.PRIVATE}>
            <Trans i18nKey={'editor.importExport.service.gitlab.visibility.private'} />
          </option>
          <option value={GitlabSnippetVisibility.INTERNAL}>
            <Trans i18nKey={'editor.importExport.service.gitlab.visibility.internal'} />
          </option>
          <option value={GitlabSnippetVisibility.PUBLIC}>
            <Trans i18nKey={'editor.importExport.service.gitlab.visibility.public'} />
          </option>
        </FormControl>
      </SidebarMenuInfoEntry>
      <Button variant={'success'} onClick={onCreateSnippet} disabled={!creationPossible} className={'mx-2 mt-2'}>
        {textCreateButton}
      </Button>
    </Fragment>
  )
}
