/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PropsWithChildren } from 'react'
import React, { Fragment, useEffect, useMemo } from 'react'

export interface PagerPageProps {
  pageIndex: number
  numberOfElementsPerPage: number
  onLastPageIndexChange: (lastPageIndex: number) => void
}

/**
 * Renders a limited number of the given children.
 *
 * @param children The children to render
 * @param numberOfElementsPerPage The number of elements per page
 * @param pageIndex Which page of the children to render
 * @param onLastPageIndexChange A callback to notify about changes to the maximal page number
 */
export const Pager: React.FC<PropsWithChildren<PagerPageProps>> = ({
  children,
  numberOfElementsPerPage,
  pageIndex,
  onLastPageIndexChange
}) => {
  const maxPageIndex = Math.ceil(React.Children.count(children) / numberOfElementsPerPage) - 1
  const correctedPageIndex = Math.min(maxPageIndex, Math.max(0, pageIndex))

  useEffect(() => {
    onLastPageIndexChange(maxPageIndex)
  }, [children, maxPageIndex, numberOfElementsPerPage, onLastPageIndexChange])

  const filteredChildren = useMemo(() => {
    return React.Children.toArray(children).filter((value, index) => {
      const pageOfElement = Math.floor(index / numberOfElementsPerPage)
      return pageOfElement === correctedPageIndex
    })
  }, [children, numberOfElementsPerPage, correctedPageIndex])

  return <Fragment>{filteredChildren}</Fragment>
}
