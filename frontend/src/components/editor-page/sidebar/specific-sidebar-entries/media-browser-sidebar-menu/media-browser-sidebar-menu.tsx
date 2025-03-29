/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import { SidebarMenu } from '../../sidebar-menu/sidebar-menu'
import type { SpecificSidebarMenuProps } from '../../types'
import { DocumentSidebarMenuSelection } from '../../types'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { ArrowLeft as IconArrowLeft, Images as IconImages } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { useAsync } from 'react-use'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { getMediaForNote } from '../../../../../api/notes'
import { AsyncLoadingBoundary } from '../../../../common/async-loading-boundary/async-loading-boundary'
import { MediaEntry } from './media-entry'
import { MediaEntryDeletionModal } from './media-entry-deletion-modal'
import { MediaBrowserEmpty } from './media-browser-empty'
import type { MediaUploadDto } from '@hedgedoc/commons'

/**
 * Renders the media browser "menu" for the sidebar.
 *
 * @param className Additional class names given to the menu button
 * @param menuId The id of the menu
 * @param onClick The callback, that should be called when the menu button is pressed
 * @param selectedMenuId The currently selected menu id
 */
export const MediaBrowserSidebarMenu: React.FC<SpecificSidebarMenuProps> = ({
  className,
  menuId,
  onClick,
  selectedMenuId
}) => {
  useTranslation()
  const noteId = useApplicationState((state) => state.noteDetails?.id ?? '')
  const [mediaEntryForDeletion, setMediaEntryForDeletion] = useState<MediaUploadDto | null>(null)

  const hide = selectedMenuId !== DocumentSidebarMenuSelection.NONE && selectedMenuId !== menuId
  const expand = selectedMenuId === menuId
  const onClickHandler = useCallback(() => {
    onClick(menuId)
  }, [menuId, onClick])

  const { value, loading, error } = useAsync(() => getMediaForNote(noteId), [expand, noteId])

  const mediaEntries = useMemo(() => {
    if (loading || error || !value) {
      return []
    }
    return value.map((entry) => <MediaEntry entry={entry} key={entry.uuid} onDelete={setMediaEntryForDeletion} />)
  }, [value, loading, error, setMediaEntryForDeletion])

  const cancelDeletion = useCallback(() => {
    setMediaEntryForDeletion(null)
  }, [])

  return (
    <Fragment>
      <SidebarButton
        hide={hide}
        icon={expand ? IconArrowLeft : IconImages}
        className={className}
        onClick={onClickHandler}>
        <Trans i18nKey={'editor.mediaBrowser.title'} />
      </SidebarButton>
      <SidebarMenu expand={expand}>
        <AsyncLoadingBoundary loading={loading} componentName={'MediaBrowserSidebarMenu'} error={error}>
          {mediaEntries}
          {mediaEntries.length === 0 && <MediaBrowserEmpty />}
        </AsyncLoadingBoundary>
      </SidebarMenu>
      {mediaEntryForDeletion && (
        <MediaEntryDeletionModal entry={mediaEntryForDeletion} show={true} onHide={cancelDeletion} />
      )}
    </Fragment>
  )
}
