# Editor Features

## Editor Modes

You can look in the bottom right section of the editor area, there you'll find a button with `SUBLIME` on it.
When you click it, you can select 3 editor modes, which will also define your shortcut keys:

- [Sublime](https://codemirror.net/demo/sublime.html) (default)
- [Emacs](https://codemirror.net/demo/emacs.html)
- [Vim](https://codemirror.net/demo/vim.html)

## Auto-Complete

This editor provides full auto-complete hints in markdown.

- Emojis: type `:` to show hints.
- Code blocks: type ` ``` `, followed by another character to show syntax highlighting suggestions.
- Headers: type `#` to show hint.
- Referrals: type `[]` to show hint.
- Externals: type `{}` to show hint.
- Images: type `!` to show hint.

## Title

The first **level 1 heading** (e.g. `# Title`) will be used as the note title.

## Tags

Tags can be specified with [YAML metadata](../references/yaml-metadata.md#tags) at the **start** of the note. Those tags will show in your **history**.

```yml
---
tags: features, cool, updated
---
```

## YAML Metadata

You can provide advanced note information to set the browser behavior. See [YAML Metadata](../references/yaml-metadata.md) for details.

## Slide Mode

You can use a special syntax to organize your note into slides.
After that, you can use the **Slide Mode** <i class="fa fa-tv"></i> to make a presentation.
To switch the editor into slide mode, set the [document type](../references/yaml-metadata.md#type) to `slide`.
