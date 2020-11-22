/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useRef } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { ForkAwesomeIcon } from '../../fork-awesome/fork-awesome-icon'
import { CopyOverlay } from '../copy-overlay'

export interface CopyableFieldProps {
  content: string
}

export const CopyableField: React.FC<CopyableFieldProps> = ({ content }) => {
  useTranslation()
  const button = useRef<HTMLButtonElement>(null)

  return (
    <Fragment>
      <InputGroup className="my-3">
        <FormControl readOnly={true} className={'text-center'} value={content} />
        <InputGroup.Append>
          <Button variant="outline-secondary" ref={button} title={'Copy'}>
            <ForkAwesomeIcon icon='files-o'/>
          </Button>
        </InputGroup.Append>
      </InputGroup>
      <CopyOverlay content={content} clickComponent={button}/>
    </Fragment>
  )
}
