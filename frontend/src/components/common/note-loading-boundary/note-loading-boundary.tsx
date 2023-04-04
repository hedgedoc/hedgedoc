/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from '../../../api/common/api-error'
import { ErrorToI18nKeyMapper } from '../../../api/common/error-to-i18n-key-mapper'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useSingleStringUrlParameter } from '../../../hooks/common/use-single-string-url-parameter'
import { LoadingScreen } from '../../application-loader/loading-screen/loading-screen'
import { CommonErrorPage } from '../../error-pages/common-error-page'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { CustomAsyncLoadingBoundary } from '../async-loading-boundary/custom-async-loading-boundary'
import { ShowIf } from '../show-if/show-if'
import { CreateNonExistingNoteHint } from './create-non-existing-note-hint'
import { useLoadNoteFromServer } from './hooks/use-load-note-from-server'
import { useRouter } from 'next/router'
import type { PropsWithChildren } from 'react'
import React, { useEffect, useMemo, useState } from 'react'

/**
 * Loads the note identified by the note-id in the URL.
 * During the loading a {@link LoadingScreen loading screen} will be rendered instead of the child elements.
 * The boundary also shows errors that occur during the loading process.
 *
 * @param children The react elements that will be shown when the loading was successful.
 */
export const NoteLoadingBoundary: React.FC<PropsWithChildren> = ({ children }) => {
  const [{ error, loading, value }, loadNoteFromServer] = useLoadNoteFromServer()
  const noteId = useSingleStringUrlParameter('noteId', '')
  const primaryNoteAddress = useApplicationState((state) => state.noteDetails.primaryAddress)
  const router = useRouter()
  const { showErrorNotification } = useUiNotifications()
  const [primaryAddressChecked, setPrimaryAddressChecked] = useState(false)

  useEffect(() => {
    if (primaryAddressChecked) {
      return
    }
    loadNoteFromServer()
  }, [loadNoteFromServer, primaryAddressChecked])

  useEffect(() => {
    if (!value || primaryAddressChecked) {
      return
    }
    if (noteId !== primaryNoteAddress) {
      router
        .replace(`/n/${primaryNoteAddress}`, undefined, { shallow: true })
        .then(() => setPrimaryAddressChecked(true))
        .catch(showErrorNotification('noteLoadingBoundary.error.redirecting'))
    } else {
      setPrimaryAddressChecked(true)
    }
  }, [
    value,
    primaryNoteAddress,
    noteId,
    router,
    showErrorNotification,
    primaryAddressChecked,
    setPrimaryAddressChecked
  ])

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
      loading={loading || !value || !primaryAddressChecked}
      error={error}
      errorComponent={errorComponent}
      loadingComponent={<LoadingScreen />}>
      {children}
    </CustomAsyncLoadingBoundary>
  )
}
