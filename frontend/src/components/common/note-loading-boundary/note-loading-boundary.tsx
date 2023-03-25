/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from '../../../api/common/api-error'
import { ErrorToI18nKeyMapper } from '../../../api/common/error-to-i18n-key-mapper'
import { LoadingScreen } from '../../application-loader/loading-screen/loading-screen'
import { CommonErrorPage } from '../../error-pages/common-error-page'
import { CustomAsyncLoadingBoundary } from '../async-loading-boundary/custom-async-loading-boundary'
import { ShowIf } from '../show-if/show-if'
import { CreateNonExistingNoteHint } from './create-non-existing-note-hint'
import { useLoadNoteFromServer } from './hooks/use-load-note-from-server'
import type { PropsWithChildren } from 'react'
import React, { useEffect, useMemo } from 'react'

/**
 * Loads the note identified by the note-id in the URL.
 * During the loading a {@link LoadingScreen loading screen} will be rendered instead of the child elements.
 * The boundary also shows errors that occur during the loading process.
 *
 * @param children The react elements that will be shown when the loading was successful.
 */
export const NoteLoadingBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  const [{ error, loading, value }, loadNoteFromServer] = useLoadNoteFromServer()

  useEffect(() => {
    loadNoteFromServer()
  }, [loadNoteFromServer])

  const errorComponent = useMemo(() => {
    if (error === undefined) {
      return null
    }
    const errorI18nKeyPrefix = new ErrorToI18nKeyMapper(error, 'noteLoadingBoundary.error')
      .withHttpCode(404, 'notFound')
      .withHttpCode(403, 'forbidden')
      .withHttpCode(401, 'forbidden')
      .orFallbackI18nKey('other')
    return (
      <CommonErrorPage
        titleI18nKey={`${errorI18nKeyPrefix}.title`}
        descriptionI18nKey={`${errorI18nKeyPrefix}.description`}>
        <ShowIf condition={error instanceof ApiError && error.statusCode === 404}>
          <CreateNonExistingNoteHint onNoteCreated={loadNoteFromServer} />
        </ShowIf>
      </CommonErrorPage>
    )
  }, [error, loadNoteFromServer])

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
