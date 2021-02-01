/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback, useRef, useState } from 'react'
import { ShowIf } from '../../common/show-if/show-if'
import { SplitDivider } from './split-divider/split-divider'
import './splitter.scss'

export interface SplitterProps {
  left: ReactElement
  right: ReactElement
  containerClassName?: string
  showLeft: boolean
  showRight: boolean
}

export const Splitter: React.FC<SplitterProps> = ({ containerClassName, left, right, showLeft, showRight }) => {
  const [split, setSplit] = useState(50)
  const realSplit = Math.max(0, Math.min(100, (showRight ? split : 100)))
  const [doResizing, setDoResizing] = useState(false)
  const splitContainer = useRef<HTMLDivElement>(null)

  const recalculateSize = (mouseXPosition: number): void => {
    if (!splitContainer.current) {
      return
    }
    const x = mouseXPosition - splitContainer.current.offsetLeft

    const newSize = x / splitContainer.current.clientWidth
    setSplit(newSize * 100)
  }

  const stopResizing = useCallback(() => {
    setDoResizing(false)
  }, [])

  const onMouseMove = useCallback((mouseEvent: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (doResizing) {
      recalculateSize(mouseEvent.pageX)
      mouseEvent.preventDefault()
    }
  }, [doResizing])

  const onTouchMove = useCallback((touchEvent: React.TouchEvent<HTMLDivElement>) => {
    if (doResizing) {
      recalculateSize(touchEvent.touches[0].pageX)
      touchEvent.preventDefault()
    }
  }, [doResizing])

  const onGrab = useCallback(() => setDoResizing(true), [])

  return (
    <div ref={splitContainer} className={`flex-fill flex-row d-flex ${containerClassName || ''}`}
         onMouseUp={stopResizing} onTouchEnd={stopResizing} onMouseMove={onMouseMove} onTouchMove={onTouchMove}>
      <div className={`splitter left ${!showLeft ? 'd-none' : ''}`} style={{ flexBasis: `calc(${realSplit}% - 5px)` }}>
        {left}
      </div>
      <ShowIf condition={showLeft && showRight}>
        <div className='splitter separator'>
          <SplitDivider onGrab={onGrab}/>
        </div>
      </ShowIf>
      <div className={`splitter right ${!showRight ? 'd-none' : ''}`}>
        {right}
      </div>
    </div>
  )
}
