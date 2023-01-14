/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
      return <></>
    }
    return (
      <CommonErrorPage titleI18nKey={`${error.message}.title`} descriptionI18nKey={`${error.message}.description`}>
        <ShowIf condition={error.message === 'api.error.note.not_found'}>
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
