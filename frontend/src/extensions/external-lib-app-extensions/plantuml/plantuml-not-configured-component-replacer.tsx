/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeReplacement } from '../../../components/markdown-renderer/replace-components/component-replacer'
import {
  ComponentReplacer,
  DO_NOT_REPLACE
} from '../../../components/markdown-renderer/replace-components/component-replacer'
import { PlantumlNotConfiguredAlert } from './plantuml-not-configured-alert'
import type { Element } from 'domhandler'

/**
 * Replaces every plantuml-not-configured tag with a {@link PlantumlNotConfiguredAlert}.
 */
export class PlantumlNotConfiguredComponentReplacer extends ComponentReplacer {
  replace(node: Element): NodeReplacement {
    return node.tagName === 'plantuml-not-configured' ? <PlantumlNotConfiguredAlert /> : DO_NOT_REPLACE
  }
}
