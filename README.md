<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

![HedgeDoc Logo](docs/content/images/hedgedoc_logo_black.svg)

[![#HedgeDoc on matrix.org][matrix.org-image]][matrix.org-url]
[![version][github-version-badge]][github-release-page]
[![POEditor][poeditor-image]][poeditor-url]
[![Mastodon][social-mastodon-image]][social-mastodon]
![REUSE Compliance Check][reuse-workflow-badge]
![Nest.JS CI][nestjs-workflow-badge]
[![codecov][codecov-badge]][codecov-url]

HedgeDoc lets you create real-time collaborative markdown notes. 

## Getting Started
- ℹ️ Read all about HedgeDoc and the history of the project on [our website](https://hedgedoc.org)
- 🧪 Try out HedgeDoc with the [demo instance][hedgedoc-demo]. Check out the [features page][hedgedoc-demo-features]!
- 💽 Install HedgeDoc yourself using the [install guide](https://docs.hedgedoc.org/setup/getting-started/)
- ❓ Questions? Join our [Matrix chat][matrix.org-url] or the [community forums][hedgedoc-community]
- 💬 Stay up to date by subscribing to the [release feed][github-release-feed]


## State of the project
HedgeDoc 1.x is stable and used around the world, but the codebase has [grown over time](https://hedgedoc.org/history/),
making it hard to add new features.  
We are currently working on HedgeDoc 2, a complete rewrite of HedgeDoc. Please note the following:

- This branch contains the latest development code and does not implement all features yet.
  **If you are looking for the 1.x source code, have a look at the [master branch](https://github.com/hedgedoc/hedgedoc/tree/master).**
- The 1.x release is maintenance-only. We do not accept feature requests or PRs for this release anymore and may choose
  to close non-critical bug reports, if the bug will be non-existent in 2.0.
- HedgeDoc 2 will be split in two components. The backend and the frontend. Both are present in this repository.

## Development
Information for setting up a local development environment can be found in the [developer documentation](https://docs.hedgedoc.dev/how-to/develop/setup/)

## HedgeDoc 2 Alpha
Curious about the new look and feel of HedgeDoc 2? We provide a demo of the alpha on [hedgedoc.dev](https://hedgedoc.dev).

If you want to try it out on your own devices, visit the [HedgeDoc 2 docs](https://docs.hedgedoc.dev).
But be aware that these may change over time.

## Contributions

We welcome contributions!  
Have a look at our [contribution docs](CONTRIBUTING.md) to find out how you can help. If you want to contribute to
HedgeDoc 2, please join our [development chat][matrix.org-dev-url].

# License

Licensed under AGPLv3. For our list of contributors, see [AUTHORS](AUTHORS).

The license does not include the HedgeDoc logo, whose terms of usage can be found in
the [github repository](https://github.com/hedgedoc/hedgedoc-logo).

[matrix.org-image]: https://img.shields.io/matrix/hedgedoc:matrix.org?logo=matrix&server_fqdn=matrix.org

[matrix.org-url]: https://chat.hedgedoc.org

[matrix.org-dev-url]: https://chat.hedgedoc.org/dev

[github-version-badge]: https://img.shields.io/github/release/hedgedoc/hedgedoc.svg

[github-release-page]: https://github.com/hedgedoc/hedgedoc/releases

[github-release-feed]: https://github.com/hedgedoc/hedgedoc/releases.atom

[github-issue-tracker]: https://github.com/hedgedoc/hedgedoc/issues/

[poeditor-image]: https://img.shields.io/badge/POEditor-translate-blue.svg

[poeditor-url]: https://poeditor.com/join/project/1OpGjF2Jir

[hedgedoc-demo]: https://hedgedoc.org/demo/

[hedgedoc-demo-features]: https://demo.hedgedoc.org/features

[hedgedoc-community]: https://community.hedgedoc.org

[hedgedoc-community-calls]: https://community.hedgedoc.org/t/codimd-community-call/19

[social-mastodon]: https://social.hedgedoc.org/mastodon

[social-mastodon-image]: https://img.shields.io/mastodon/follow/109259563190314667?domain=https%3A%2F%2Ffosstodon.org&style=social

[reuse-workflow-badge]: https://github.com/hedgedoc/hedgedoc/workflows/REUSE%20Compliance%20Check/badge.svg

[nestjs-workflow-badge]: https://github.com/hedgedoc/hedgedoc/workflows/Nest.JS%20CI/badge.svg

[codecov-badge]: https://codecov.io/gh/hedgedoc/hedgedoc/branch/develop/graph/badge.svg?token=pdaRF4qjNQ

[codecov-url]: https://codecov.io/gh/hedgedoc/hedgedoc
