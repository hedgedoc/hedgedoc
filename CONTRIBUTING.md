# Contributing to HedgeDoc

HedgeDoc is a volunteer effort.
We encourage you to pitch in and to help us making this project even better!

Please note we have a [code of conduct][code-of-conduct], please respect it in all your
interactions with the project.

## Ways of contributing
### Do you have questions about the project?

* Feel free to post your question on our [community forum][community-forum] or join our [matrix community chat][matrix-support].

### Did you find a bug?

* **Ensure the bug wasn't already reported** by searching on GitHub under [Issues][issues].

* If you're unable to find an open issue addressing the problem, [open a new one][new_issue]. Be sure to use one of the templates we provide if your request applies to them.

### Did you write a patch that fixes a bug?

* Open a new GitHub pull request with the patch. See the section [submitting a pull request](#submitting-a-pull-request) for details on this.

* Ensure the PR description is precise about the problem and your solution. Just fill out our template. That should cover the most important information.

### Do you intend to add a new feature or change an existing one?

* Suggest your idea via a new GitHub issue. After a confirmation about your idea, you can start writing code. Our maintainers and other project developers can provide useful details about the architecture and show you relevant issues and discussions.

### Do you want to work on translations?

* If you want to improve a translation or add a new translation altogether, we handle those via [POEditor][poeditor].

## Certificate of Origin

By contributing to this project you agree to the [Developer Certificate of
Origin (DCO)](docs/content/legal/developer-certificate-of-origin.txt). This document was created by the Linux Kernel community and is a
simple statement that you, as a contributor, have the legal right to make the
contribution. 
The DCO is a legally binding statement, please [read it carefully](docs/content/legal/developer-certificate-of-origin.txt).

If you can certify it, then just add a line to every git commit message:

```
  Signed-off-by: Jane Doe <jane.doe@example.org>
```

Use your real name (sorry, no pseudonyms or anonymous contributions).

If you set your `user.name` and `user.email` git configs, you can sign your commit automatically with `git commit -s`.
You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`.
Now you can commit with `git ci` and the commit will be signed.

## Submitting a Pull Request

1. Submit an issue describing your proposed change.
   We will try to respond to your issue as soon as possible.
2. Fork this repo, develop and test your code changes. Ensure you signed all your commits (see above for details).
3. Submit a pull request against this repo's `master` branch.
4. Your branch may be merged once all configured checks pass.

[code-of-conduct]: ./CODE-OF-CONDUCT.md
[community-forum]: https://community.hedgedoc.org
[matrix-support]: https://chat.hedgedoc.org
[issues]: https://github.com/hedgedoc/hedgedoc/issues
[new_issue]: https://github.com/hedgedoc/hedgedoc/issues/new/choose
[poeditor]: https://translate.hedgedoc.org
