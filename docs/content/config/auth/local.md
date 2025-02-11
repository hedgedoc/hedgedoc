# Local

HedgeDoc provides local accounts, handled internally. This feature only provides basic
functionality, so for most environments, we recommend using an external authentication mechanism,
which also enables more secure authentication like 2FA or Passkeys.

| environment variable                      | default | example                 | description                                                                                         |
|-------------------------------------------|---------|-------------------------|-----------------------------------------------------------------------------------------------------|
| `HD_AUTH_LOCAL_ENABLE_LOGIN`              | `false` | `true`, `false`         | This makes it possible to use the local accounts in HedgeDoc.                                       |
| `HD_AUTH_LOCAL_ENABLE_REGISTER`           | `false` | `true`, `false`         | This makes it possible to register new local accounts in HedgeDoc.                                  |
| `HD_AUTH_LOCAL_MINIMAL_PASSWORD_STRENGTH` | `2`     | `0`, `1`, `2`, `3`, `4` | The minimum password score, that passwords need to have. See the table below for more explanations. |

## Password score

The password score is calculated with [zxcvbn-ts][zxcvbn-ts-score].

| score | meaning                                                           | minimum number of guesses required (approximated) |
|:-----:|-------------------------------------------------------------------|---------------------------------------------------|
|   0   | All passwords with minimum 6 characters are allowed               | -                                                 |
|   1   | Only `too guessable` passwords are disallowed                     | 1.000                                             |
|   2   | `too guessable` and `very guessable` passwords are disallowed     | 1.000.000                                         |
|   3   | `safely unguessable` and `very unguessable` passwords are allowed | 100.000.000                                       |
|   4   | Only `very unguessable` passwords are allowed                     | 10.000.000.000                                    |

[zxcvbn-ts-score]: https://zxcvbn-ts.github.io/zxcvbn/guide/getting-started/#output
