# General

| environment variable     | default                | example                     | description                                                                                                                                            |
|--------------------------|------------------------|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `HD_BASE_URL`            | -                      | `https://md.example.com`    | The URL the HedgeDoc instance is accessed with, like it is entered in the browser                                                                      |
| `HD_BACKEND_PORT`        | 3000                   |                             | The port the backend process listens on.                                                                                                               |
| `HD_FRONTEND_PORT`       | 3001                   |                             | The port the frontend process listens on.                                                                                                              |
| `HD_RENDERER_BASE_URL`   | Content of HD_BASE_URL |                             | The URL the renderer runs on. If omitted this will be the same as `HD_BASE_URL`. For more detail see [this faq entry][faq-entry]                       |
| `HD_INTERNAL_API_URL`    | Content of HD_BASE_URL | `http://localhost:3000`     | This URL is used by the frontend to access the backend directly if it can't reach the backend using the `HD_BASE_URL`                                  |
| `HD_LOGLEVEL`            | warn                   |                             | The loglevel that should be used. Options are `error`, `warn`, `info`, `debug` or `trace`.                                                             |
| `HD_FORBIDDEN_NOTE_IDS`  | -                      | `notAllowed,alsoNotAllowed` | A list of note ids (separated by `,`), that are not allowed to be created or requested by anyone.                                                      |
| `HD_MAX_DOCUMENT_LENGTH` | 100000                 |                             | The maximum length of any one document. Changes to this will impact performance for your users.                                                        |
| `HD_PERSIST_INTERVAL`    | 10                     | `0`, `5`, `10`, `20`        | The time interval in **minutes** for the periodic note revision creation during realtime editing. `0` deactivates the periodic note revision creation. |

[faq-entry]: ../../faq/index.md#why-should-i-want-to-run-my-renderer-on-a-different-sub-domain
