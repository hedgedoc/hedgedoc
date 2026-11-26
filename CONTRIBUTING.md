<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Contributing to HedgeDoc

Thanks for your help in improving the HedgeDoc project!

Please note we have a [code of conduct][code-of-conduct], please follow it in all your interactions with the project.
Please also review our information regarding the state of HedgeDoc 1.x and 2.0 in the README as well as our [security notice][security].

## Do you have questions about the project?

Feel free to post your question on our [community forum][community-forum] or join our [matrix community chat][matrix-support].

If you need help with your contribution, or have some open questions, feel free to ask them in the [dedicated matrix room for development][matrix-dev].

## Ways of contributing

Contributions can be more than only code. We're happy about:

- [improving our translations](#translations),
- [reporting of bugs or feature requests](#bug-reports-and-feature-requests),
- [extending and improving our documentation](#documentation) as well as
- [code contributions](#code-contributions).

### Translations

* If you want to improve a translation or add a new translation altogether, we handle those for HedgeDoc 1.x via [POEditor][poeditor].
* Please do not open pull requests or issues for translation updates or fixes.

### Bug reports and feature requests

* **Ensure the bug or feature request wasn't already reported** by searching on GitHub under [Issues][issues].

* If you're unable to find an open issue addressing the problem, [open a new one][new_issue]. Be sure to use one of the
  templates we provide and fill them out with all required information.
* It might be useful for us if you can provide a minimal reproducible example of the bug. For feature requests it might be helpful if you can provide some example usecases.
* Please understand that we might reject feature requests or non-severe bug reports.
* Please do not open pull requests directly without an issue.

### Documentation

* If you encounter issues or missing content in our documentation, review our [issues][issues] and open a new one in case there is none matching yet.
* For contributing to the documentation you can search for [open issues with the type "documentation"][docs-issues]. Please inform in the issue that you'd like to work on it in order to avoid duplicate work being done.

### Code contributions

* **Always open an issue before submitting a pull request.** In case of new features, we might first need to discuss how this fits in, possible problems, and so on. So in order to avoid spending time and efforts in a pull request that can't get merged, again please only submit a pull request after confirmation in a matching issue.
* **Review our [policy regarding LLM-generated code](#llm-policy)**, the section about [signing-off the DCO](#certificate-of-origin), and the [commit and code conventions](#commit-and-code-conventions).
* Open a new GitHub pull request with the patch.
* Ensure the PR description is precise about the problem and your solution. Fill out our template. Pull requests that do not use the template description will get closed.
* Please note that we only accept PRs for the 1.x releases if they fix critical issues.
* **Choose the correct base branch:**  
  The code for 1.x lives in the `master` branch. The documentation under docs.hedgedoc.org is also deployed from there until 2.0 is released.  
  HedgeDoc 2.x is developed in the `develop` branch.
* Please respect that we reserve the right to reject contributions without further reasons if they seem to violate our contribution guidelines.

## LLM policy

LLMs and other AI-based tools can be supportive tools in the development process but they do not replace a human developer.
We do not want to spend time for reviewing AI-generated "slop" contributions, neither discuss things with an AI bot.
We're furthermore under the impression that the use of LLMs for more than simple refactorings does not comply with the legally binding [certificate of origin](#certificate-of-origin), that is mandatory to sign off for contributions to HedgeDoc.

For this reason, we will close pull requests created by or with extensive help of AI agents such as Claude, Codex, Copilot and others.

Repeated violations of this policy can result in you being excluded from being able to provide contributions to HedgeDoc.

## Certificate of Origin

By contributing to this project you agree to
the [Developer Certificate of Origin (DCO)](developer-certificate-of-origin.txt). This document was created
by the Linux Kernel community and is a simple statement that you, as a contributor, have the legal right to make the
contribution. The DCO is a legally binding statement,
please [read it carefully](developer-certificate-of-origin.txt).

If you can certify it, then just add a line to every git commit message:

```
Signed-off-by: Random J Developer <random@developer.example.org>
```

Use your real name (sorry, no pseudonyms or anonymous contributions).

### How to sign-off commits

The sign-off message can either be added by hand to your commit message or automatically by git.

This is accomplished by using the `-s` or `--signoff` option on your regular commit command.

Example:

```bash
git commit -s # or --signoff instead of -s
```

This will use the name and email you configured in git.

Find out how you can change your name and email in this guide from [GitHub](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-user-account/managing-email-preferences/setting-your-commit-email-address#setting-your-commit-email-address-in-git)

#### How to amend a sign-off

The last commit on any given branch can be amended to include the sign-off message like this:

```bash
git commit --amend --signoff
```

#### Amend a sign-off to multiple commits

Assuming you have the upstream hedgedoc repo as `upstream`:

```bash
# get the latest content from the upstream repository
git fetch upstream

# rebase and sign-off all commits in your current branch, that are different from upstream
git rebase --signoff upstream/master # replace master with develop for 2.0

# If you've already pushed these commits to GitHub, you'll need to force push your branch after this
git push --force-with-lease
```

## Commit and code conventions

### Codestyle, linting and tests

* We use code quality tools like linters and formatters to ensure the codebase stays in a good maintainable shape. Before creating a commit, please ensure that the linting and formatting tasks pass. You can inspect the `package.json` for the available scripts.
* Contributions to HedgeDoc 2.0 should include tests for the added (or modified) functionality. Tests should ensure functionality works as expected, but we don't need to test that external library methods work, or that the language itself works.

### Changelog snippets

* Code contributions to HedgeDoc 1.x should be noted as a changelog entry in `public/docs/release-notes.md`.
* Code contributions to HedgeDoc 2.0 don't require a changelog entry prior the release.
* Add your entries under `## <i class="fa fa-tag"></i> 1.x.x <i class="fa fa-calendar-o"></i> UNRELEASED` or create that section if it does not exist yet.
* Changelog entries should be sorted into a section **Features**, **Enhancements** or **Bugfixes**. If the section does not exist yet, add it.
* Add a short description for your change. Have a look at previous entries for inspiration.
* You are welcome to add yourself to the contributors section, otherwise this will be done by the maintainers.

### Clean git history

* We avoid merge commits in the repository, so please **use rebase instead of merge** when updating your branch.
* Separate different features or fixes into separate commits where it makes sense. This makes it easier to find bugs or regressions with tools like `git bisect`.
* Sort fixes and additions into the right commits. This can be done using the `--fixup` commit flag in git as well as the `git rebase --autosquash ...` command.

### Commit messages

* **We use [conventional commits][conventional-commits]**, please format your commit messages accordingly.
* Use one of the following types: `feat` for features, `fix` for fixes, `docs` for documentation, `test` for tests, `refactor` for refactorings, `chore` for maintenance work like dependency updates and `ci` for work on the CI pipeline.
* Use the body of the commit message to explain your change in a few sentences. This can help use understand your commit better a few months or years later when revisiting it for whatever reason.
* You can get some inspiration about writing good commit messages here: <https://chris.beams.io/posts/git-commit/>.

[code-of-conduct]: ./CODE_OF_CONDUCT.md

[community-forum]: https://community.hedgedoc.org

[matrix-support]: https://chat.hedgedoc.org

[matrix-dev]: https://chat.hedgedoc.org/dev

[issues]: https://github.com/hedgedoc/hedgedoc/issues

[new_issue]: https://github.com/hedgedoc/hedgedoc/issues/new/choose

[poeditor]: https://translate.hedgedoc.org

[security]: ./SECURITY.md

[docs-issues]: https://github.com/hedgedoc/hedgedoc/issues?q=is%3Aissue+state%3Aopen+type%3ADocumentation

[conventional-commits]: https://www.conventionalcommits.org/en/v1.0.0/
