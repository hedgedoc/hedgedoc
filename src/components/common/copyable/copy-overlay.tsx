import React, { RefObject, useCallback, useEffect, useState } from 'react'
import { Overlay, Tooltip } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { v4 as uuid } from 'uuid'
import { ShowIf } from '../show-if/show-if'

export interface CopyOverlayProps {
  content: string
  clickComponent: RefObject<HTMLElement>
}

export const CopyOverlay: React.FC<CopyOverlayProps> = ({ content, clickComponent }) => {
  useTranslation()
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
  const [error, setError] = useState(false)
  const [tooltipId] = useState<string>(() => uuid())

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setError(false)
    }).catch(() => {
      setError(true)
      console.error("couldn't copy")
    }).finally(() => {
      setShowCopiedTooltip(true)
      setTimeout(() => { setShowCopiedTooltip(false) }, 2000)
    })
  }, [])

  useEffect(() => {
    if (clickComponent && clickComponent.current) {
      clickComponent.current.addEventListener('click', () => copyToClipboard(content))
      const clickComponentSaved = clickComponent.current
      return () => {
        if (clickComponentSaved) {
          clickComponentSaved.removeEventListener('click', () => copyToClipboard(content))
        }
      }
    }
  }, [clickComponent, copyToClipboard, content])

  return (
    <Overlay target={clickComponent} show={showCopiedTooltip} placement="top">
      {(props) => (
        <Tooltip id={`copied_${tooltipId}`} {...props}>
          <ShowIf condition={error}>
            <Trans i18nKey={'common.copyError'}/>
          </ShowIf>
          <ShowIf condition={!error}>
            <Trans i18nKey={'common.successfullyCopied'}/>
          </ShowIf>
        </Tooltip>
      )}
    </Overlay>
  )
}
