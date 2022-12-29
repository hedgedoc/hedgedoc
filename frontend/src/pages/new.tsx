/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNote } from '../api/notes'
import { LoadingScreen } from '../components/application-loader/loading-screen/loading-screen'
import { CustomAsyncLoadingBoundary } from '../components/common/async-loading-boundary/custom-async-loading-boundary'
import { Redirect } from '../components/common/redirect'
import { CommonErrorPage } from '../components/error-pages/common-error-page'
import { useSingleStringUrlParameter } from '../hooks/common/use-single-string-url-parameter'
import type { NextPage } from 'next'
import { useAsync } from 'react-use'

/**
 * Creates a new note, optionally including the passed content and redirects to that note.
 */
export const NewNotePage: NextPage = () => {
  const newContent = useSingleStringUrlParameter('content', '')

  const { loading, error, value } = useAsync(() => {
    return createNote(newContent)
  }, [newContent])

  return (
    <CustomAsyncLoadingBoundary
      loading={loading || !value}
      error={error}
      loadingComponent={<LoadingScreen />}
      errorComponent={
        <CommonErrorPage
          titleI18nKey={'errors.noteCreationFailed.title'}
          descriptionI18nKey={'errors.noteCreationFailed.description'}
        />
      }>
      {value ? <Redirect to={`/n/${value.metadata.primaryAddress}`} /> : null}
    </CustomAsyncLoadingBoundary>
  )
}

export default NewNotePage
