<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

## How to contribute to HedgeDoc react-client

Thanks for your interest in contributing. Here are some common scenarios for what you may want to contribute to.

#### Do you have questions about the project?

* Feel free to post your question on our [Discourse][discourse] or join our [Matrix Support Channel][matrix-support].

#### Did you find a bug?

* **Ensure the bug wasn't already reported** by searching on GitHub under [Issues][issues].

* If you're unable to find an open issue addressing the problem, [open a new one][new_issue]. Be sure to use one of the templates we provide if your request applies to them. If not, use the 'Question / Other' template.

#### Did you write a patch that fixes a bug?

* Open a new GitHub pull request with the patch.

* Ensure the PR description is precise about the problem and your solution. Just fill out our template. That should cover the most important information.

#### Do you intend to add a new feature or change an existing one?

* Suggest your idea in the [HedgeDoc Dev Channel][matrix-dev] and start writing code. Our maintainers and other project developers can provide useful details about the architecture and show you relevant issues and discussions.

#### Do you want to work on translations?

If you want to improve a translation or add a new translation altogether, we handle those via [POEditor][poeditor].

HedgeDoc is a volunteer effort. We encourage you to pitch in and to help us making this project even better.

Thanks! :heart: :heart: :heart:

## Certificate of Origin

By contributing to this project you agree to the [Developer Certificate of
Origin (DCO)](developer-certificate-of-origin.txt). This document was created by the Linux Kernel community and is a
simple statement that you, as a contributor, have the legal right to make the
contribution.
The DCO is a legally binding statement, please [read it carefully](developer-certificate-of-origin.txt).

If you can certify it, then just add a line to every git commit message:

```
  Signed-off-by: Jane Doe <jane.doe@example.org>
```

Use your real name (sorry, no pseudonyms or anonymous contributions).

If you set your `user.name` and `user.email` git configs, you can sign your commit automatically with `git commit -s`.
You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases) like `git config --global alias.ci 'commit -s'`.
Now you can commit with `git ci` and the commit will be signed.

## Code Style

Most of the code style is enforced by [prettier](https://prettier.io/) and our [eslint](https://eslint.org) configuration.
If your IDE doesn't support integration of prettier and/or eslint you can use the npm tasks `lint` and `format` to check your code style.

For both npm tasks, there is also an additional `:fix` task. This will try to fix the code to the best of either tools ability.

### Number of lines

Try to keep the files as short as possible while keeping the context between the code parts by
- splitting your code into multiple files. Especially react components can and should be separated into atomic components and custom hooks.
- avoiding repetition.
- extracting types and interfaces into `.d.ts` files.

### Function Style

We prefer lambda functions over the `function` keyword. Simple functions, that return a value can be shortened to one-liners.

:+1: Good:
```typescript=
const addTwo = (x: number): number => x + 2
```

:-1: Bad:
```typescript=
function addTwo (x: number): number {
    return x + 2
}
```

### Function naming

Names of functions should
- be as short as possible while clearly communicating their purpose.
- not include technical details, if not necessary.
- avoid abbreviations.

:+1: Good:
```typescript=
const addTwo = (x: number): number => x + 2
```

:-1: Bad:
```typescript=
const doStuffWithX = (x: number): number => x + 2
```

:-1: Bad:
```typescript=
const incrementXTwoTimesButNotRecursive = (x: number): number => x + 2
```

:-1: Bad:
```typescript=
const clcX = (x: number): number => x + 2
```


### Documentation of functions

To make the code as clear as possible to everyone, who will try to understand it, every function must have an [ESDoc](https://esdoc.org/).

Please make sure that your documenation can be read in a standard text editor (hard line breaks at ~120 characters, etc.).

The documentation must
- explain what the function does. If the explanation is longer than one line, then write a short introdoctory first line, followed by a break and then the longer explanation.
- contain every parameter with the `@param name explaination` annotation, that explains the purpose of the parameter.
- contain a `@return description` annotation if the return type isn't `void`, that explains the meaning of the value.
- contain `@throws ErrorClass description` annotations if the function throws runtime errors or doesn't catch errors from other method calls.
- contain a blank line between the description and the annotation block.

The described annotations must appear in this order: `@param`, `@return`, `@throws`

Example:
```typescript=
/**
 * Calculates the divison of the given divisor and divident.
 *
 * @param divisor The divisor for the calculation
 * @param divident The divident for the calculation
 * @return The calculated division.
 * @throws Error if the divident is zero.
 */
const divide = (divisor: number, divident: number): number => {
    if (divident === 0) {
        throw new Error("Can not divide by zero")
    }
    return divisor / divident
}
```

### Documentation of types and interfaces

Every exported type and interface must have an [ESDoc](https://esdoc.org/). No special annotations are needed.

### React components

React components
- must be functional. Use the `React.FC` type.
- can omit the `@return` annotation in the ESDoc if it returns always the same React DOM.
- should use the [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) hook where possible. Don't use inline functions.
- should use [custom hooks](https://reactjs.org/docs/hooks-custom.html) to extract long functions to reduce the number of lines in the component file.
- must be placed in files that have the same name as the component, but in [kebab-case](https://stackoverflow.com/a/17820138). This file can also contain the interface for the properties.
- should be named in [PascalCase](https://en.wikipedia.org/wiki/Pascal_case).


### Logging

- Don't log directly to the console. Use our logging class `Logger` in "src/utils".
- Create one instance of `Logger` per file. Don't pass or share the instances.
- The first argument of the constructor is the scope. Use the name of the class or component whose behaviour you want to log or choose an explanatory name.
- If you want to add a sub scope (because e.g. you have two components that are similar or are used together, like the sub-classes of the iframe communicator), separate the main and sub scope with " > ".
- Scopes should be upper camel case.
- Log messages should never start with a lowercase letter.
- Log messages should never end with a colon or white space.

#### Example File: `increment-number-button.tsx`:
```typescript=

/**
 * Properties for the {@link IncrementNumberButton}
 */
export interface IncrementNumberButtonProps {
    prefix: string
}

const logger = new Logger("IncrementNumberButton")

/**
 * Shows a button that contains a text and a number that gets incremented each time you click it.
 *
 * @param prefix A text that should be added before the number.
 */
export const IncrementNumberButton: React.FC<IncrementNumberButtonProps> = ({ prefix }) => {
    const [counter, setCounter] = useState(0)

    const incrementCounter = useCallback(() => {
        setCounter((lastCounter) => lastCounter + 1)
        logger.info("Increased counter")
    }, [])

    return <button onClick={incrementCounter}>{prefix}: {counter}</button>
}
```

[issues]: https://github.com/hedgedoc/react-client/issues
[new_issue]: https://github.com/hedgedoc/react-client/issues/new/choose
[matrix-support]: https://matrix.to/#/#hedgedoc:matrix.org
[matrix-dev]: https://matrix.to/#/#hedgedoc-dev:matrix.org
[discourse]: https://community.hedgedoc.org/
[poeditor]: https://translate.hedgedoc.org/
