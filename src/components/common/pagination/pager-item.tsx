/*
 SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

 SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'

export interface PageItemProps {
  onClick: (index: number) => void
  index: number
}

export const PagerItem: React.FC<PageItemProps> = ({ index, onClick }) => {
  return (
    <li className="page-item">
      <span className="page-link" role="button" onClick={ () => onClick(index) }>
        { index + 1 }
      </span>
    </li>
  )
}
