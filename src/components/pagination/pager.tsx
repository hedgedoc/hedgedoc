import React, { Fragment, useEffect } from 'react'

export interface PagerPageProps {
    pageIndex: number
    numberOfElementsPerPage: number
    onLastPageIndexChange: (lastPageIndex: number) => void
}

export const Pager: React.FC<PagerPageProps> = ({ children, numberOfElementsPerPage, pageIndex, onLastPageIndexChange }) => {
  const maxPageIndex = Math.ceil(React.Children.count(children) / numberOfElementsPerPage) - 1
  const correctedPageIndex = Math.min(maxPageIndex, Math.max(0, pageIndex))

  useEffect(() => {
    onLastPageIndexChange(maxPageIndex)
  }, [children, maxPageIndex, numberOfElementsPerPage, onLastPageIndexChange])

  return <Fragment>
    {
      React.Children.toArray(children).filter((value, index) => {
        const pageOfElement = Math.floor((index) / numberOfElementsPerPage)
        return (pageOfElement === correctedPageIndex)
      })
    }
  </Fragment>
}
