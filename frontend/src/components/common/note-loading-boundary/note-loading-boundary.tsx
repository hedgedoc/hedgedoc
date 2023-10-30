'use client'
/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from '../../../api/common/api-error'
import { ErrorToI18nKeyMapper } from '../../../api/common/error-to-i18n-key-mapper'
import { Logger } from '../../../utils/logger'
import { LoadingScreen } from '../../application-loader/loading-screen/loading-screen'
import { CommonErrorPage } from '../../error-pages/common-error-page'
import { CustomAsyncLoadingBoundary } from '../async-loading-boundary/custom-async-loading-boundary'
import { CreateNonExistingNoteHint } from './create-non-existing-note-hint'
import { useLoadNoteFromServer } from './hooks/use-load-note-from-server'
import type { PropsWithChildren } from 'react'
import React, { useEffect, useMemo } from 'react'
import { unloadNote } from '../../../redux/note-details/methods'

const logger = new Logger('NoteLoadingBoundary')

export interface NoteIdProps {
  noteId: string | undefined
}

/**
 * Loads the note identified by the note-id in the URL.
 * During the loading a {@link LoadingScreen loading screen} will be rendered instead of the child elements.
 * The boundary also shows errors that occur during the loading process.
 *
 * @param children The react elements that will be shown when the loading was successful
 * @param noteId the id of the note to load
 */
export const NoteLoadingBoundary: React.FC<PropsWithChildren<NoteIdProps>> = ({ children, noteId }) => {
  const [{ error, loading, value }, loadNoteFromServer] = useLoadNoteFromServer(noteId)

  useEffect(() => {
    loadNoteFromServer()
  }, [loadNoteFromServer])

  useEffect(
    () => () => {
      unloadNote()
    },
    []
  )

  const errorComponent = useMemo(() => {
    if (error === undefined) {
      return null
    }
    const errorI18nKeyPrefix = new ErrorToI18nKeyMapper(error, 'noteLoadingBoundary.error')
      .withHttpCode(404, 'notFound')
      .withHttpCode(403, 'forbidden')
      .withHttpCode(401, 'forbidden')
      .orFallbackI18nKey('other')
    logger.error(error)
    return (
      <CommonErrorPage
        titleI18nKey={`${errorI18nKeyPrefix}.title`}
        descriptionI18nKey={`${errorI18nKeyPrefix}.description`}>
        {error instanceof ApiError && error.statusCode === 404 && (
          <CreateNonExistingNoteHint onNoteCreated={loadNoteFromServer} noteId={noteId} />
        )}
      </CommonErrorPage>
    )
  }, [error, loadNoteFromServer, noteId])

  return (
    <CustomAsyncLoadingBoundary
      loading={loading || !value}
      error={error}
      errorComponent={errorComponent}
      loadingComponent={<LoadingScreen />}>
      {children}
    </CustomAsyncLoadingBoundary>
  )
}
