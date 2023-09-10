/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Card } from 'react-bootstrap'
import { Trans } from 'react-i18next'
import { LocalRegisterForm } from './local-register-form'
import { LocalRegisterButton } from './local-register-button'

/**
 * Shows a bootstrap card body for the register process that switches from a button to the form.
 */
export const LocalRegisterCardBody: React.FC = () => {
  const [showForm, setShowForm] = useState(false)

  const doShowForm = useCallback(() => {
    setShowForm(true)
  }, [])

  const content = useMemo(() => {
    if (showForm) {
      return <LocalRegisterForm />
    } else {
      return <LocalRegisterButton onClick={doShowForm} />
    }
  }, [doShowForm, showForm])

  return (
    <Card.Body>
      <Card.Title>
        <Trans i18nKey={'login.register.question'} />
      </Card.Title>
      {content}
    </Card.Body>
  )
}
