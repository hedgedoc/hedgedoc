/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React from 'react'
import { Button } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import { LinkContainer } from 'react-router-bootstrap'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'

export const NewGuestNoteButton: React.FC = () => {
  const { t } = useTranslation()
  return (
    <LinkContainer to={'/new'} title={t('landing.navigation.newGuestNote')}>
      <Button
        variant="primary"
        size="sm"
        className="d-inline-flex align-items-center">
        <ForkAwesomeIcon icon="plus" className="mx-1"/>
        <span>
          <Trans i18nKey='landing.navigation.newGuestNote'/>
        </span>
      </Button>
    </LinkContainer>)
}
