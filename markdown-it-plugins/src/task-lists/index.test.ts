/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: MIT
 */

import MarkdownIt from 'markdown-it/lib'
import { taskLists } from './index.js'
import { describe, expect, it } from '@jest/globals'

describe('markdown-it-task-lists', () => {
  it('renders bullet correctly', () => {
    const taskListMarkdownParser = new MarkdownIt().use(taskLists)
    expect(
      taskListMarkdownParser.render(`
- [ ] unchecked item 1
- [ ] unchecked item 2
- [ ] unchecked item 3
- [x] checked item 4
`)
    ).toMatchSnapshot()
  })

  it('renders dirty correctly', () => {
    const taskListMarkdownParser = new MarkdownIt().use(taskLists)
    expect(
      taskListMarkdownParser.render(`
-   [ ] unchecked todo item 1
- [ ]
- [  ] not a todo item 2
- [ x] not a todo item 3
- [x ] not a todo item 4
- [ x ] not a todo item 5
-   [x] todo item 6
`)
    ).toMatchSnapshot()
  })

  it('renders mixedNested correctly', () => {
    const taskListMarkdownParser = new MarkdownIt().use(taskLists)
    expect(
      taskListMarkdownParser.render(`
# Test 1

1. foo
   * [ ] nested unchecked item 1
   * not a todo item 2
   * not a todo item 3
   * [x] nested checked item 4
2. bar
3. spam

# Test 2

- foo
  - [ ] nested unchecked item 1
  - [ ] nested unchecked item 2
  - [x] nested checked item 3
  - [X] nested checked item 4
`)
    ).toMatchSnapshot()
  })
  it('renders ordered correctly', () => {
    const taskListMarkdownParser = new MarkdownIt().use(taskLists)
    expect(
      taskListMarkdownParser.render(`
1. [x] checked ordered 1
2. [ ] unchecked ordered 2
3. [x] checked ordered 3
4. [ ] unchecked ordered 4
`)
    ).toMatchSnapshot()
  })
})
