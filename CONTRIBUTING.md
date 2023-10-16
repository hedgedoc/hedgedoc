<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Contributing to HedgeDoc

Thanks for your help in improving the HedgeDoc project!

Please note we have a [code of conduct][code-of-conduct], please follow it in all your interactions with the project.

## Ways of contributing

### Do you have questions about the project?

* Feel free to post your question on our [community forum][community-forum] or join
  our [matrix community chat][matrix-support].

### Did you find a bug?

* **Ensure the bug wasn't already reported** by searching on GitHub under [Issues][issues].

* If you're unable to find an open issue addressing the problem, [open a new one][new_issue]. Be sure to use one of the
  templates we provide if your request applies to them.

### Did you write a patch that fixes a bug?

* Open a new GitHub pull request with the patch. See the section [submitting a pull request](#submitting-a-pull-request)
  for details on this.

* Ensure the PR description is precise about the problem and your solution. Just fill out our template. That should
  cover the most important information.

* Please note that we only accept PRs for the 1.x releases if they fix critical issues. If you are unsure if your fix is
  critical, it's best to ask us before you start coding.

* **Choose the correct base branch:**  
  The code for 1.x lives in the `master` branch. docs.hedgedoc.org is also deployed from there until 2.0 is released.  
  HedgeDoc 2.x is developed in the `develop` branch.

### Do you intend to add a new feature or change an existing one?

* Suggest your idea via a new GitHub issue. After a confirmation about your idea, you can start writing code. Our
  maintainers and other project developers can provide useful details about the architecture and show you relevant
  issues and discussions.

### Do you want to work on translations?

* If you want to improve a translation or add a new translation altogether, we handle those via [POEditor][poeditor].

HedgeDoc is a volunteer effort. We encourage you to pitch in and help us to make this project even better.

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

e.g.
```bash
git commit -s
```
or
```bash
git commit --signoff
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

Run `git fetch upstream` to get the latest content from the upstream repository
and then use `git rebase --signoff upstream/master` or `git rebase --signoff upstream/develop`
to rebase all commits in your current branch, that are different from upstream you try to merge with, and sign them off.

If you've already pushed these commits to GitHub, you'll need to force push your branch after this with `git push --force-with-lease`.

## Changelog snippets

PRs that fix a bug or add a new feature or enhancement should add a corresponding changelog entry.
The changelog can be found at `public/docs/release-notes.md`. If there is no section for the next release yet, just add
one using `## <i class="fa fa-tag"></i> 1.x.x <i class="fa fa-calendar-o"></i> UNRELEASED`. The version and date will
be filled later by the maintainers.  
Add a short description for your change in the `Features`, `Enhancements` or `Bugfixes` section, creating the section
if needed. Have a look at previous entries for inspiration.
You are welcome to add a `(by [@your_username](https://github.com/your_username))` note to your entry.

## Submitting a Pull Request

1. Submit an issue describing your proposed change. We will try to respond to your issue promptly.
2. Fork this repo, develop and test your code changes. Ensure you follow the commit guidelines (see below)
   and signed all your commits (see above for details).
3. Submit a pull request against this repo's `develop` branch for 2.x or the `master` branch for 1.x.
4. Your branch may be merged once all configured checks pass.

### Commit guidelines

- Follow these rules when writing a commit message:
  1. Separate subject from body with a blank line
  2. Limit the subject line to 50 characters
  3. If you worked on a specific part of the application, you can prefix your commit message with that Example: "
     MediaService: Get media backend from configuration"
  3. Capitalize the subject line
  4. Do not end the subject line with a period
  5. Use the imperative mood in the subject line
  6. Wrap the body at 72 characters
  7. Use the body to explain what and why vs. how

  These are inspired by https://chris.beams.io/posts/git-commit/
- Split your change into small, atomic commits. This helps reviewing the changes and enables the use of `git bisect`.
- Ensure the commit history is easy to follow. Use `git rebase -i` to sort and squash your commits if neccessary.
- If your branch includes fixup commits (like "Fix typo...", "Fix tests..."), use `git rebase -i` to clean them up
  before submitting a pull request.
- When refactoring something, take care to not include any functional changes into the same commit. Mixing refactoring
  and functional changes makes it hard to find the cause of regressions.

[code-of-conduct]: ./CODE_OF_CONDUCT.md

[community-forum]: https://community.hedgedoc.org

[matrix-support]: https://matrix.to/#/#hedgedoc:matrix.org

[issues]: https://github.com/hedgedoc/hedgedoc/issues

[new_issue]: https://github.com/hedgedoc/hedgedoc/issues/new/choose

[poeditor]: https://translate.hedgedoc.org
