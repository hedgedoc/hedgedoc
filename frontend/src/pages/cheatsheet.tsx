/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CheatsheetContent } from '../components/cheatsheet/cheatsheet-content'
import { useApplyDarkModeStyle } from '../hooks/dark-mode/use-apply-dark-mode-style'
import type { NextPage } from 'next'
import { Container } from 'react-bootstrap'

const CheatsheetPage: NextPage = () => {
  useApplyDarkModeStyle()

  return (
    <Container>
      <CheatsheetContent></CheatsheetContent>
    </Container>
  )
}

export default CheatsheetPage
