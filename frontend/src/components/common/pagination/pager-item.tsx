/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'

export interface PageItemProps {
  onClick: (index: number) => void
  index: number
}

/**
 * Renders a number and adds an onClick handler to it.
 *
 * @param index The number to render
 * @param onClick The onClick Handler
 */
export const PagerItem: React.FC<PageItemProps> = ({ index, onClick }) => {
  return (
    <li className='page-item'>
      <span className='page-link' role='button' onClick={() => onClick(index)}>
        {index + 1}
      </span>
    </li>
  )
}
