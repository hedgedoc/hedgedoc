/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import type { ComponentReplacer } from '../replace-components/component-replacer'
import { CsvReplacer } from '../replace-components/csv/csv-replacer'
import { HighlightedCodeReplacer } from '../replace-components/highlighted-fence/highlighted-fence-replacer'
import type { ImageClickHandler } from '../replace-components/image/image-replacer'
import { ImageReplacer } from '../replace-components/image/image-replacer'
import { KatexReplacer } from '../replace-components/katex/katex-replacer'
import { LinemarkerReplacer } from '../replace-components/linemarker/linemarker-replacer'
import { LinkReplacer } from '../replace-components/link-replacer/link-replacer'
import { ColoredBlockquoteReplacer } from '../replace-components/colored-blockquote/colored-blockquote-replacer'
import type { TaskCheckedChangeHandler } from '../replace-components/task-list/task-list-replacer'
import { TaskListReplacer } from '../replace-components/task-list/task-list-replacer'
import { CodeBlockComponentReplacer } from '../replace-components/code-block-component-replacer'
import { GraphvizFrame } from '../replace-components/graphviz/graphviz-frame'
import { MarkmapFrame } from '../replace-components/markmap/markmap-frame'
import { VegaChart } from '../replace-components/vega-lite/vega-chart'
import { MermaidChart } from '../replace-components/mermaid/mermaid-chart'
import { FlowChart } from '../replace-components/flow/flowchart'
import { SequenceDiagram } from '../replace-components/sequence-diagram/sequence-diagram'
import { AbcFrame } from '../replace-components/abc/abc-frame'
import { CustomTagWithIdComponentReplacer } from '../replace-components/custom-tag-with-id-component-replacer'
import { GistFrame } from '../replace-components/gist/gist-frame'
import { YouTubeFrame } from '../replace-components/youtube/youtube-frame'
import { VimeoFrame } from '../replace-components/vimeo/vimeo-frame'
import { AsciinemaFrame } from '../replace-components/asciinema/asciinema-frame'

/**
 * Provides a function that creates a list of {@link ComponentReplacer component replacer} instances.
 *
 * @param onTaskCheckedChange A callback that gets executed if a task checkbox gets clicked
 * @param onImageClick A callback that should be executed if an image gets clicked
 * @param baseUrl The base url for relative links
 * @param frontmatterLinesToSkip The number of lines of the frontmatter part to add this as offset to line-numbers.
 *
 * @return the created list
 */
export const useComponentReplacers = (
  onTaskCheckedChange?: TaskCheckedChangeHandler,
  onImageClick?: ImageClickHandler,
  baseUrl?: string,
  frontmatterLinesToSkip?: number
): ComponentReplacer[] =>
  useMemo(
    () => [
      new LinemarkerReplacer(),
      new CustomTagWithIdComponentReplacer(GistFrame, 'gist'),
      new CustomTagWithIdComponentReplacer(YouTubeFrame, 'youtube'),
      new CustomTagWithIdComponentReplacer(VimeoFrame, 'vimeo'),
      new CustomTagWithIdComponentReplacer(AsciinemaFrame, 'asciinema'),
      new ImageReplacer(onImageClick),
      new CsvReplacer(),
      new CodeBlockComponentReplacer(AbcFrame, 'abc'),
      new CodeBlockComponentReplacer(SequenceDiagram, 'sequence'),
      new CodeBlockComponentReplacer(FlowChart, 'flow'),
      new CodeBlockComponentReplacer(MermaidChart, 'mermaid'),
      new CodeBlockComponentReplacer(GraphvizFrame, 'graphviz'),
      new CodeBlockComponentReplacer(MarkmapFrame, 'markmap'),
      new CodeBlockComponentReplacer(VegaChart, 'vega-lite'),
      new HighlightedCodeReplacer(),
      new ColoredBlockquoteReplacer(),
      new KatexReplacer(),
      new TaskListReplacer(frontmatterLinesToSkip, onTaskCheckedChange),
      new LinkReplacer(baseUrl)
    ],
    [onImageClick, onTaskCheckedChange, baseUrl, frontmatterLinesToSkip]
  )
