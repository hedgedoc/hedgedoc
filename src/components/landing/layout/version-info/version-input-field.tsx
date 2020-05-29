import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Fragment, useRef, useState } from 'react'
import { Button, FormControl, InputGroup, Overlay, Tooltip } from 'react-bootstrap'
import { Trans } from 'react-i18next'

export interface VersionInputFieldProps {
  version: string
}

export const VersionInputField: React.FC<VersionInputFieldProps> = ({ version }) => {
  const inputField = useRef<HTMLInputElement>(null)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setShowCopiedTooltip(true)
      setTimeout(() => { setShowCopiedTooltip(false) }, 2000)
    }).catch(() => {
      console.error("couldn't copy")
    })
  }

  return (
    <Fragment>
      <Overlay target={inputField} show={showCopiedTooltip} placement="top">
        {(props) => (
          <Tooltip id={'copied_' + version} {...props}>
            <Trans i18nKey={'successfullyCopied'}/>
          </Tooltip>
        )}
      </Overlay>

      <InputGroup className="mb-3">
        <FormControl readOnly={true} ref={inputField} className={'text-center'} value={version} />
        <InputGroup.Append>
          <Button variant="outline-secondary" onClick={() => copyToClipboard(version)} title={'Copy'}>
            <FontAwesomeIcon icon={'copy'}/>
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Fragment>
  )
}
