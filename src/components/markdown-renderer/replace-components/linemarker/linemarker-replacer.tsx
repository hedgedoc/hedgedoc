/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { DomElement } from 'domhandler'
import { ComponentReplacer } from '../ComponentReplacer'

export class LinemarkerReplacer extends ComponentReplacer {
  public getReplacement (codeNode: DomElement): null | undefined {
    return codeNode.name === 'app-linemarker' ? null : undefined
  }
}
