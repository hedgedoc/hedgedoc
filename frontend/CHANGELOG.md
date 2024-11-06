<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Changelog

## [Unreleased]

### Deprecations
- This version of HedgeDoc is the last version, that supports the following short code syntax for embedding content. The
  new way to embed this external content is to put the plain link into a single line of the document.
    - `{%youtube someid %}` -> https://youtube.com/watch?v=someid
    - `{%vimeo 123456789 %}` -> https://vimeo.com/123456789
    - `{%gist user/12345 %}` -> https://gist.github.com/user/12345
    - `{%slideshare user/my-awesome-presentation %}` -> Embedding removed
    - `{%speakerdeck foobar %}` -> Embedding removed
    - `{%pdf https://example.org/example-pdf.pdf %}` -> Embedding removed
- The use of `sequence` as code block language ([Why?](https://github.com/hedgedoc/react-client/issues/488#issuecomment-683262875))
- Comma-separated definition of tags in the yaml-frontmatter

### Removed

- SlideShare embedding
    - If a legacy embedding code is detected, then it will show the link to the presentation instead of the embedded
      presentation.
- Speakerdeck embedding
    - If a legacy embedding code is detected, then it will show the link to the presentation instead of the embedded
      presentation.
- PDF embedding (See [#959](https://github.com/hedgedoc/react-client/issues/959))
    - If a legacy embedding code is detected, then it will show the link to the pdf instead.
- We are now using `highlight.js` instead of `highlight.js` + `prism.js` for code highlighting. Check out
  the [highlight.js demo page](https://highlightjs.org/static/demo/) to see which languages are supported. The
  highlighting for following languages isn't supported by `highlight.js`:
    - tiddlywiki
    - mediawiki
    - jsx
- Alternative anchor URL formats
- Import HTML and convert to Markdown
- Import content from a url
- F9 shortcut to sort lines
- Highlight.JS language support for `1c` was removed.
- Support for tag definitions in headings
- Fork Awesome has been replaced with [Bootstrap Icons](https://icons.getbootstrap.com/)

### Added

- A new table view for the history (besides the card view)
- Better support for RTL-languages (and LTR-content in a RTL-page)
- Users may now change their display name and password (only email accounts) on the new profile page
- Highlighted code blocks can now use line wrapping and line numbers at once
- Notes may now be deleted directly from the history page
- HedgeDoc instances can be branded either with a '@ \<custom string\>' or '@ \<custom logo\>' after the HedgeDoc logo and text
- Images will be loaded via proxy if an image proxy is configured in the backend
- Asciinema videos may be embedded by pasting the URL of one video into a single line
- The toolbar includes an emoji picker.
- Collapsible blocks can be added via a toolbar button or via autocompletion of "<details"
- Added shortcodes for icons (e.g. `:bi-picture:`)
- The code button now adds code fences even if the user selected nothing beforehand
- Code blocks with 'csv' as language render as tables.
- All images can be clicked to show them in full screen.
- Code blocks have a 'Copy code to clipboard' button.
- Code blocks with 'vega-lite' as language are rendered as [vega-lite diagrams](https://vega.github.io/vega-lite/examples/).
- Markdown files can be imported into an existing note directly from the editor.
- The table button in the toolbar opens an overlay where the user can choose the number of columns and rows.
- A toggle in the editor preferences for turning ligatures on and off.
- Easier possibility to share notes via native share-buttons on supported devices.
- Surround selected text with a link via shortcut (ctrl+k or cmd+k).
- A sidebar for menu options
- Improved security by wrapping the markdown rendering into an iframe.
- The intro page content can be changed by editing `public/intro.md`.
- When pasting tables (e.g. from LibreOffice Calc or MS Excel) they get reformatted to markdown tables.
- The history page supports URL parameters that allow bookmarking of a specific search of tags filter.
- Users can change the pinning state of a note directly from the editor.
- Note information dialog containing word count, revision count, last editor and creation time.
- Image tags with placeholder urls (`https://`) will be replaced with a placeholder frame.
- Images that are currently uploading will be rendered as "uploading".
- Code blocks with `plantuml` as language are rendered as [PlantUML](https://plantuml.com/) diagram using a configured render server.
- File based motd that supports markdown without html.
- New notes can be created with a pre-given content when accessing `/new?content=Example%20content`.
- Custom error message if you try to upload a big image and it exceed the maximum allowed.

### Changed

- The sign-in/sign-up functions are now on a separate page
- The email sign-in/registration does not require an email address anymore but uses a username
- The history shows both the entries saved in LocalStorage and the entries saved on the server together
- The gist embedding uses a click-shield, like vimeo and youtube
- HTML-Iframes are capsuled in click-shields
- Use [Twemoji](https://twemoji.twitter.com/) as icon font
- The `[name=...]`, `[time=...]` and `[color=...]` tags may now be used anywhere in the document and not just inside of blockquotes and lists.
- The <i class="fa fa-picture-o"/> (add image) and <i class="fa fa-link"/> (add link) toolbar buttons put selected links directly in the `()` instead of the `[]` part of the generated markdown.
- The help dialog has multiple tabs, and is a bit more organized.
- Use KaTeX instead of MathJax. ([Why?](https://github.com/hedgedoc/react-client/issues/495))
- The dark-mode is also applied to the read-only-view and can be toggled from there.
- Access tokens for the CLI and 3rd-party-clients can be managed in the user profile.
- Change editor font to "Fira Code"
- Note tags can be set as yaml-array in frontmatter.
- If only one external login provider is configured, the sign-in button will directly link to it.
- Links in Gist-Frames work only if explicitly opened in new tabs.
- Changed default editor-placeholder to include the full url to the /features-page as new users might not find it otherwise.

---

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
