import React, { ReactElement, useRef, useState } from 'react'
import { ShowIf } from '../show-if/show-if'
import { SplitDivider } from '../split-divider/split-divider'
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

  return (
    <div ref={splitContainer} className={`flex-fill flex-row d-flex ${containerClassName || ''}`}
      onMouseUp={() => setDoResizing(false)}
      onTouchEnd={() => setDoResizing(false)}
      onMouseMove={(mouseEvent) => {
        if (doResizing) {
          recalculateSize(mouseEvent.pageX)
          mouseEvent.preventDefault()
        }
      }}
      onTouchMove={(touchEvent) => {
        if (doResizing) {
          recalculateSize(touchEvent.touches[0].pageX)
        }
      }}
    >
      <ShowIf condition={showLeft}>
        <div className={'splitter left'} style={{ flexBasis: `calc(${realSplit}% - 5px)` }}>
          {left}
        </div>
      </ShowIf>
      <ShowIf condition={showLeft && showRight}>
        <div className='splitter separator'>
          <SplitDivider onGrab={() => setDoResizing(true)}/>
        </div>
      </ShowIf>
      <ShowIf condition={showRight}>
        <div className='splitter right'>
          {right}
        </div>
      </ShowIf>
    </div>
  )
}
