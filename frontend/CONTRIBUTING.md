<!--
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

## Frontend Code Style

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
