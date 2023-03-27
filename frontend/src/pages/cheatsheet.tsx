/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CheatsheetContent } from '../components/editor-page/app-bar/cheatsheet/cheatsheet-content'
import { useApplyDarkMode } from '../hooks/common/use-apply-dark-mode'
import type { NextPage } from 'next'
import { Container } from 'react-bootstrap'

const CheatsheetPage: NextPage = () => {
  useApplyDarkMode()

  return (
    <Container>
      <CheatsheetContent></CheatsheetContent>
    </Container>
  )
}

export default CheatsheetPage
