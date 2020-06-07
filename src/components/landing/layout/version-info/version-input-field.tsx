import React, { Fragment, useRef, useState } from 'react'
import { Button, FormControl, InputGroup, Overlay, Tooltip } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'

export interface VersionInputFieldProps {
  version: string
}

export const VersionInputField: React.FC<VersionInputFieldProps> = ({ version }) => {
  useTranslation()
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
            <Trans i18nKey={'landing.versionInfo.successfullyCopied'}/>
          </Tooltip>
        )}
      </Overlay>

      <InputGroup className="mb-3">
        <FormControl readOnly={true} ref={inputField} className={'text-center'} value={version} />
        <InputGroup.Append>
          <Button variant="outline-secondary" onClick={() => copyToClipboard(version)} title={'Copy'}>
            <ForkAwesomeIcon icon='files-o'/>
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Fragment>
  )
}
