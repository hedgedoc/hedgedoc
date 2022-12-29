/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren, ReactNode } from 'react'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

export interface CustomErrorAsyncLoadingBoundaryProps {
  loading: boolean
  error?: Error | boolean
  errorComponent: ReactNode
  loadingComponent: ReactNode
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
export const CustomAsyncLoadingBoundary: React.FC<PropsWithChildren<CustomErrorAsyncLoadingBoundaryProps>> = ({
  loading,
  error,
  errorComponent,
  loadingComponent,
  children
}) => {
  useTranslation()
  if (error) {
    return <Fragment>{errorComponent}</Fragment>
  } else if (loading) {
    return <Fragment>{loadingComponent}</Fragment>
  } else {
    return <Fragment>{children}</Fragment>
  }
}
