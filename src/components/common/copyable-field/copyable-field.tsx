import React, { Fragment, useCallback, useRef, useState } from 'react'
import { Button, FormControl, InputGroup, Overlay, Tooltip } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../fork-awesome/fork-awesome-icon'

export interface CopyableFieldProps {
  content: string
}

export const CopyableField: React.FC<CopyableFieldProps> = ({ content }) => {
  useTranslation()
  const inputField = useRef<HTMLInputElement>(null)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)

  const copyToClipboard = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setShowCopiedTooltip(true)
      setTimeout(() => { setShowCopiedTooltip(false) }, 2000)
    }).catch(() => {
      console.error("couldn't copy")
    })
  }, [])

  const selectContent = useCallback(() => {
    if (!inputField.current) {
      return
    }
    inputField.current.focus()
    inputField.current.setSelectionRange(0, inputField.current.value.length)
  }, [inputField])

  return (
    <Fragment>
      <Overlay target={inputField} show={showCopiedTooltip} placement="top">
        {(props) => (
          <Tooltip id={'copied_' + content} {...props}>
            <Trans i18nKey={'landing.versionInfo.successfullyCopied'}/>
          </Tooltip>
        )}
      </Overlay>

      <InputGroup className="my-3">
        <FormControl readOnly={true} ref={inputField} className={'text-center'} value={content} onMouseEnter={selectContent} />
        <InputGroup.Append>
          <Button variant="outline-secondary" onClick={() => copyToClipboard(content)} title={'Copy'}>
            <ForkAwesomeIcon icon='files-o'/>
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Fragment>
  )
}
