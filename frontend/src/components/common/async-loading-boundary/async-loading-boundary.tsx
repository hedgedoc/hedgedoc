/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { WaitSpinner } from '../wait-spinner/wait-spinner'
import { CustomAsyncLoadingBoundary } from './custom-async-loading-boundary'
import type { PropsWithChildren } from 'react'
import React, { Fragment, useMemo } from 'react'
import { Alert } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export interface AsyncLoadingBoundaryProps {
  loading: boolean
  error?: Error | boolean
  componentName: string
}

/**
 * Indicates that a component currently loading or an error occurred.
 * It's meant to be used in combination with useAsync from react-use.
 *
 * @param loading Indicates that the component is currently loading. Setting this will show a spinner instead of the children.
 * @param error Indicates that an error occurred during the loading process. Setting this to any non-null value will show an error message instead of the children.
 * @param componentName The name of the component that is currently loading. It will be shown in the error message.
 * @param errorComponent Optional component that will be used in case of an error instead of the default alert message.
 * @param children The child {@link ReactElement elements} that are only shown if the component isn't in loading or error state
 */
export const AsyncLoadingBoundary: React.FC<PropsWithChildren<AsyncLoadingBoundaryProps>> = ({
  loading,
  error,
  componentName,
  children
}) => {
  useTranslation()

  const errorComponent = useMemo(() => {
    return error ? (
      <Alert variant={'danger'}>
        <Trans i18nKey={'common.errorWhileLoading'} values={{ name: componentName }} />
      </Alert>
    ) : (
      <Fragment></Fragment>
    )
  }, [componentName, error])

  return (
    <CustomAsyncLoadingBoundary
      loading={loading}
      error={error}
      errorComponent={errorComponent}
      loadingComponent={<WaitSpinner />}>
      {children}
    </CustomAsyncLoadingBoundary>
  )
}
