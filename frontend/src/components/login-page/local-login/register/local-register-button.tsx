/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans } from 'react-i18next'

interface LocalRegisterButtonProps {
  onClick: () => void
}

/**
 * Shows a button that triggers the register process.
 *
 * @param onClick The callback that is executed when the button is clicked
 */
export const LocalRegisterButton: React.FC<LocalRegisterButtonProps> = ({ onClick }) => {
  return (
    <Button type='button' variant='secondary' onClick={onClick}>
      <Trans i18nKey='login.register.title' />
    </Button>
  )
}
