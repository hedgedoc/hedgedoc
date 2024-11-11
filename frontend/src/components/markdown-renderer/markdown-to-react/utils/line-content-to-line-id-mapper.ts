/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { LineWithId } from '../../extensions/linemarker/types'
import type { ArrayChange } from 'diff'
import { diffArrays } from 'diff'

type NewLine = string
type LineChange = ArrayChange<NewLine | LineWithId>

/**
 * Calculates ids for every line in a given text and memorized the state of the last given text.
 * It also assigns ids for new lines on every update.
 */
export class LineContentToLineIdMapper {
  private lastLines: LineWithId[] = []
  private lastUsedLineId = 0

  /**
   * Calculates a line id mapping for the given line based text by creating a diff
   * with the last lines code.
   *
   * @param newMarkdownContentLines The markdown content for which the line ids should be calculated
   * @return the calculated {@link LineWithId lines with unique ids}
   */
  public updateLineMapping(newMarkdownContentLines: string[]): LineWithId[] {
    const lineDifferences = this.diffNewLinesWithLastLineKeys(newMarkdownContentLines)
    const newLineKeys = this.convertChangesToLinesWithIds(lineDifferences)
    this.lastLines = newLineKeys
    return newLineKeys
  }

  /**
   * Creates a diff between the given {@link string lines} and the existing {@link LineWithId lines with unique ids}.
   * The diff is based on the line content.
   *
   * @param lines The plain lines that describe the new state.
   * @return {@link LineChange line changes} that describe the difference between the given and the old lines. Because of the way the used diff-lib works, the ADDED lines will be tagged as "removed", because if two lines are the same the lib takes the line from the NEW lines, which results in a loss of the unique id.
   */
  private diffNewLinesWithLastLineKeys(lines: string[]): LineChange[] {
    return diffArrays<NewLine, LineWithId>(lines, this.lastLines, {
      comparator: (left: NewLine | LineWithId, right: NewLine | LineWithId) => {
        const leftLine = (left as LineWithId).line ?? (left as NewLine)
        const rightLine = (right as LineWithId).line ?? (right as NewLine)
        return leftLine === rightLine
      }
    })
  }

  /**
   * Converts the given {@link LineChange line changes} to {@link lines with unique ids}.
   * Only not changed or added lines will be processed.
   *
   * @param changes The {@link LineChange changes} whose lines should be converted.
   * @return The created or reused {@link LineWithId lines with ids}
   */
  private convertChangesToLinesWithIds(changes: LineChange[]): LineWithId[] {
    return changes
      .filter(
        (change) =>
          LineContentToLineIdMapper.changeIsNotChangingLines(change) ||
          LineContentToLineIdMapper.changeIsAddingLines(change)
      )
      .flatMap((currentChange) => this.convertChangeToLinesWithIds(currentChange))
  }

  /**
   * Defines if the given {@link LineChange change} is neither adding or removing lines.
   *
   * @param change The {@link LineChange change} to check.
   * @return {@link true} if the given change is neither adding nor removing lines.
   */
  private static changeIsNotChangingLines(change: LineChange): boolean {
    return change.added === false && change.removed === false
  }

  /**
   * Defines if the given {@link LineChange change} contains new, not existing lines.
   *
   * @param change The {@link LineChange change} to check.
   * @return {@link true} if the given change contains {@link NewLine new lines}
   */
  private static changeIsAddingLines(change: LineChange): change is ArrayChange<NewLine> {
    return change.removed === true
  }

  /**
   * Converts the given {@link LineChange change} into {@link LineWithId lines with unique ids} by inspecting the contained lines.
   * This is done by either reusing the existing ids (if the line wasn't added),
   * or by assigning new, unused line ids.
   *
   * @param change The {@link LineChange change} whose lines should be converted.
   * @return The created or reused {@link LineWithId lines with ids}
   */
  private convertChangeToLinesWithIds(change: LineChange): LineWithId[] {
    if (LineContentToLineIdMapper.changeIsAddingLines(change)) {
      return change.value.map((line) => {
        this.lastUsedLineId += 1
        return { line: line, id: this.lastUsedLineId }
      })
    } else {
      return change.value as LineWithId[]
    }
  }
}
