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

### Added

- A new table view for the history (besides the card view)
- Better support for RTL-languages (and LTR-content in a RTL-page)
- Users may now change their display name and password (only email accounts) on the new profile page

### Changed

- The sign-in/sign-up functions are now on a separate page
- The history shows both the entries saved in LocalStorage and the entries saved on the server together
- The gist and pdf embeddings now use a one-click aproach similar to vimeo and youtube
- Use [Twemoji](https://twemoji.twitter.com/) as icon font

---

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
