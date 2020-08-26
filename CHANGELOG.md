# Changelog

## [Unreleased]

### Deprecations
- This version of CodiMD is the last version that supports the following short-code syntaxes for embedding content. Embedding works now instead by putting the plain webpage link to the content into a single line.
    - `{%youtube someid %}` -> https://youtube.com/watch?v=someid
    - `{%vimeo 123456789 %}` -> https://vimeo.com/123456789
    - `{%gist user/12345 %}` -> https://gist.github.com/user/12345
    - `{%slideshare user/my-awesome-presentation %}` -> Embedding removed
    - `{%speakerdeck foobar %}` -> Embedding removed

### Removed

- SlideShare embedding
    - If a legacy embedding code is detected it will show the link to the presentation instead of the embedded presentation
- Speakerdeck embedding
    - If a legacy embedding code is detected it will show the link to the presentation instead of the embedded presentation
- We are now using `highlight.js` instead of `highlight.js` + `prism.js` for code highlighting. Check out the [highlight.js demo page](https://highlightjs.org/static/demo/) to see which languages are supported.
 The highlighting for following languages isn't supported by `highlight.js`:
    - tiddlywiki
    - mediawiki
    - jsx
- Alternative anchor URL formats

### Added

- A new table view for the history (besides the card view)
- Better support for RTL-languages (and LTR-content in a RTL-page)
- Users may now change their display name and password (only email accounts) on the new profile page
- Highlighted code blocks can now use line wrapping and line numbers at once
- Images, videos, and other non-text content is now wider in View Mode
- Notes may now be deleted directly from the history page
- CodiMD instances can now be branded either with a '@ <custom string>' or '@ <custom logo>' after the CodiMD logo and text
- Images will be loaded via proxy if an image proxy is configured in the backend
- Asciinema videos may now be embedded by pasting the URL of one video into a single line
- The Toolbar includes an EmojiPicker
- Added shortcodes for [fork-awesome icons](https://forkaweso.me/Fork-Awesome/icons/) (e.g. `:fa-picture-o:`)
- The code button now adds code fences even if the user selected nothing beforehand

### Changed

- The sign-in/sign-up functions are now on a separate page
- The email sign-in/registration does not require an email address anymore but uses a username
- The history shows both the entries saved in LocalStorage and the entries saved on the server together
- The gist and pdf embeddings now use a one-click aproach similar to vimeo and youtube
- Use [Twemoji](https://twemoji.twitter.com/) as icon font
- The `[name=...]`, `[time=...]` and `[color=...]` tags may now be used anywhere in the document and not just inside of blockquotes and lists.
- The <i class="fa fa-picture-o"/> (add image) and <i class="fa fa-link"/> (add link) toolbar buttons, put selected links directly in the `()` instead of the `[]` part of the generated markdown
- The help dialog has multiple tabs, and is a bit more organized.

---

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
