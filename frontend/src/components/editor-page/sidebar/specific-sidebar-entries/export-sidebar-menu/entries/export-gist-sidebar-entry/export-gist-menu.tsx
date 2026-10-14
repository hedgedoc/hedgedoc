/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { Button, FormCheck, FormControl, FormGroup, FormText } from 'react-bootstrap'
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
import { SidebarMenuInfoEntry } from '../../../../sidebar-menu-info-entry/sidebar-menu-info-entry'

export interface ExportGistMenuProps {
  onExportFinished: () => void
}

/**
 * Renders the menu for exporting the note content to a GitHub Gist.
 *
 * @param onExportFinished The callback to call after the export has finished
 */
export const ExportGistMenu: React.FC<ExportGistMenuProps> = ({ onExportFinished }) => {
  useTranslation()

  const noteContent = useNoteMarkdownContent()
  const noteFilename = useNoteFilename()

  const { dispatchUiNotification, showErrorNotificationBuilder } = useUiNotifications()

  const textService = useTranslatedText('editor.importExport.service.gist.name')
  const textShortName = useTranslatedText('editor.importExport.service.gist.shortName')
  const textCreateButton = useTranslatedText('editor.importExport.export.createButton', {
    replace: { shortName: textShortName }
  })
  const textNotificationButton = useTranslatedText('editor.importExport.export.notificationSuccessButton', {
    replace: {
      shortName: textShortName
    }
  })
  const textFieldPublic = useTranslatedText('editor.importExport.service.gist.makePublic')
  const textTokenLink = useTranslatedText('editor.importExport.service.gist.tokenLink')

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
          'editor.importExport.export.notificationSuccessTitle',
          'editor.importExport.export.notificationSuccessMessage',
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
    ghToken,
    noteContent,
    noteFilename,
    gistDescription,
    gistPublic,
    showErrorNotificationBuilder,
    textShortName,
    dispatchUiNotification,
    textNotificationButton,
    textService,
    onExportFinished
  ])

  return (
    <Fragment>
      <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.importExport.common.accessToken'} border={false}>
        <FormGroup className={'my-2'}>
          <FormControl value={ghToken} onChange={onGhTokenChange} type={'password'} isInvalid={!ghTokenFormatValid} />
          <FormText muted={true}>
            <Trans i18nKey={'editor.importExport.service.gist.infoToken'} />{' '}
            <ExternalLink text={textTokenLink} href={'https://github.com/settings/personal-access-tokens/new'} />
          </FormText>
        </FormGroup>
      </SidebarMenuInfoEntry>
      <SidebarMenuInfoEntry className={'py-2'} titleI18nKey={'editor.importExport.common.description'} border={false}>
        <FormControl value={gistDescription} onChange={onGistDescriptionChange} type={'text'} />
      </SidebarMenuInfoEntry>
      <SidebarMenuInfoEntry className={'mt-2'} titleI18nKey={'editor.importExport.service.gist.makePublic'}>
        <FormCheck checked={gistPublic} onChange={onGistPublicChange} type={'checkbox'} label={textFieldPublic} />
      </SidebarMenuInfoEntry>
      <Button variant={'success'} onClick={onCreateGist} disabled={!ghTokenFormatValid} className={'mx-2 mt-2'}>
        {textCreateButton}
      </Button>
    </Fragment>
  )
}
