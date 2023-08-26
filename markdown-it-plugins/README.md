<!--
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC0-1.0
-->

# Markdown-It plugins

This repository contains plugins for [Markdown-It](https://github.com/markdown-it/markdown-it) that are used by HedgeDoc.
All these plugins are (re)created in typescript.

## License
Everything is licensed under MIT

## Usage
Install the lib using `yarn install @hedgedoc/markdown-it-plugins` or `npm i @hedgedoc/markdown-it-plugins`

## Development
If you want to contribute to this lib then:
- Clone this repository
- Install the dependencies using `yarn install`. Don't use `npm`!
- Make your changes
- Make sure that your changes are covered by tests. Use `yarn test` to run all tests
- Make sure that your code follows the code style. Use `yarn lint` to check the style
- Commit your changes (please use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)) and create a pull request

## markdown-it-image-size
A markdown-it plugin for size-specified image markups. This plugin overloads the original image renderer of markdown-it.
> This is a typescript port of https://github.com/tatsy/markdown-it-imsize without the local file system support.

### Usage

#### Enable plugin

```ts
import MarkdownIt from 'markdown-it'
import { imageSize } from '@hedgedoc/markdown-it-plugins'

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typography: true
}).use(imageSize);
```

#### Example

```md
![test](image.png =100x200)
```

is interpreted as

```html
<p><img src="image.png" alt="test" width="100" height="200"></p>
```

## markdown-it-better-task-lists

A markdown-it plugin that renders GitHub-style task-lists. It builds [task/todo lists](https://github.com/blog/1825-task-lists-in-all-markdown-documents) out of Markdown lists with items starting with `[ ]` or `[x]`.

This is a typescript port of [markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists).

### Why is this useful?

When you have markdown documentation with checklists, rendering HTML checkboxes
out of the list items looks nicer than the raw square brackets.

### Usage

Use it the same as a normal markdown-it plugin:

```ts
import MarkdownIt from 'markdown-it'
import { taskLists } from '@hedgedoc/markdown-it-plugins'

const parser = new MarkdownIt().use(taskLists)

const result = parser.render(`
- [ ] Open task
- [x] Done task
- Not a task
`) // markdown string containing task list items
```

The rendered checkboxes are disabled; to change this, set `enabled` property of the
plugin options to `true`:

```ts
const parser = new MarkdownIt().use(taskLists, { enabled: true })
```

If you need to know which line in the markdown document the generated checkbox comes
set the `lineNumber` property of the plugin options to `true` for the
`<input>` tag to be created with a data-line attribute containing the line number:

```ts
const parser = new MarkdownIt().use(taskLists, { lineNumber: true })
```

If you'd like to wrap the rendered list items in a `<label>` element for UX
purposes, set the `label` property of the plugin options to `true`:

```ts
const parser = new MarkdownIt().use(taskLists, { label: true })
```

To add the label after the checkbox set the `labelAfter` property of the plugin
options to `true`:

```ts
const parser = new MarkdownIt().use(taskLists, { label: true, labelAfter: true })
```

**Note:** This option does require the `label` option to be truthy.

The options can be combined, of course.

## markdown-it-toc

A markdown-it plugin that renders a table of contents.
It uses the found headlines as content.

This is a typescript port of [markdown-it-toc-done-right](https://github.com/nagaozen/markdown-it-toc-done-right).

### Usage

Use it the same as a normal markdown-it plugin:

```ts
import MarkdownIt from 'markdown-it'
import { toc } from '@hedgedoc/markdown-it-plugins'

const parser = new MarkdownIt().use(toc)

const result = parser.render(`
[toc]

# head 1

# head 2
`) // markdown string containing task list items
```
