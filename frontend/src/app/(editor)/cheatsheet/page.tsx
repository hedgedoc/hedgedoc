'use client'

/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CheatsheetContent } from '../../../components/cheatsheet/cheatsheet-content'
import type { NextPage } from 'next'
import { Container } from 'react-bootstrap'

const CheatsheetPage: NextPage = () => {
  return (
    <Container>
      <CheatsheetContent />
    </Container>
  )
}

export default CheatsheetPage
