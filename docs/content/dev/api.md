# API documentation
Several tasks of HedgeDoc can be automated through HTTP requests.
The available endpoints for this api are described in this document.
For code-autogeneration there is an OpenAPIv3-compatible description available [here](openapi.yml).

## Notes
These endpoints create notes, return information about them or export them.  
You have to replace *\<NOTE\>* with either the alias or id of a note you want to work on. 

| Endpoint                                       | HTTP-Method | Description                                                                                                                                                                                                                                                  |
| ---------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/new`                                         | `GET`       | **Creates a new note.**<br>A random id will be assigned and the content will equal to the template (blank by default). After note creation a redirect is issued to the created note.                                                                         |
| `/new`                                         | `POST`      | **Imports some markdown data into a new note.**<br>A random id will be assigned and the content will equal to the body of the received HTTP-request. The `Content-Type: text/markdown` header should be set on this request.                                 |
| `/new/<ALIAS>`                                 | `POST`      | **Imports some markdown data into a new note with a given alias.**<br>This endpoint equals to the above one except that the alias from the url will be assigned to the note if [FreeURL-mode](../configuration.md#users-and-privileges) is enabled. |
| `/<NOTE>/download` or `/s/<SHORT-ID>/download` | `GET`       | **Returns the raw markdown content of a note.**                                                                                                                                                                                                              |
| `/<NOTE>/publish`                              | `GET`       | **Redirects to the published version of the note.**                                                                                                                                                                                                          |
| `/<NOTE>/slide`                                | `GET`       | **Redirects to the slide-presentation of the note.**<br>This is only useful on notes which are designed to be slides.                                                                                                                                        |
| `/<NOTE>/info`                                 | `GET`       | **Returns metadata about the note.**<br>This includes the title and description of the note as well as the creation date and viewcount. The data is returned as a JSON object.                                                                               |
| `/<NOTE>/revision`                             | `GET`       | **Returns a list of the available note revisions.**<br>The list is returned as a JSON object with an array of revision-id and length associations. The revision-id equals to the timestamp when the revision was saved.                                      |
| `/<NOTE>/revision/<REVISION-ID>`               | `GET`       | **Returns the revision of the note with some metadata.**<br>The revision is returned as a JSON object with the content of the note and the authorship.                                                                                                       |
| `/<NOTE>/gist`                                 | `GET`       | **Creates a new GitHub Gist with the note's content.**<br>If [GitHub integration](../configuration.md#github-login) is configured, the user will be redirected to GitHub and a new Gist with the content of the note will be created.               |

## User / History
These endpoints return information about the current logged-in user and it's note history. If no user is logged-in, the most of this requests will fail with either a HTTP 403 or a JSON object containing `{"status":"forbidden"}`.

| Endpoint                 | HTTP-Method | Description                                                                                                                                                                                       |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/me`                    | `GET`       | **Returns the profile data of the current logged-in user.**<br>The data is returned as a JSON object containing the user-id, the user's name and a url to the profile picture.                    |
| `/me/export`             | `GET`       | **Exports a zip-archive with all notes of the current user.**                                                                                                                                     |
| `/history`               | `GET`       | **Returns a list of the last viewed notes.**<br>The list is returned as a JSON object with an array containing for each entry it's id, title, tags, last visit time and pinned status.            |
| `/history`               | `POST`      | **Replace user's history with a new one.**<br>The body must be form-encoded and contain a field `history` with a JSON-encoded array like its returned from the server when exporting the history. |
| `/history?token=<TOKEN>` | `DELETE`    | **Deletes the user's history.**<br>Requires the user token since HedgeDoc 1.10.4 to prevent CSRF-attacks. The token can be obtained from the `/config` endpoint when logged-in.                   |
| `/history/<NOTE>`        | `POST`      | **Toggles the pinned status in the history for a note.**<br>The body must be form-encoded and contain a field `pinned` that is either `true` or `false`.                                          |
| `/history/<NOTE>`        | `DELETE`    | **Deletes a note from the user's history.**                                                                                                                                                       |

## HedgeDoc-server
These endpoints return information about the running HedgeDoc instance.

| Endpoint   | HTTP-Method | Description                                                                                                                                                                              |
| ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/status`  | `GET`       | **Returns the current status of the HedgeDoc instance.**<br>The data is returned as a JSON object containing the number of notes stored on the server, (distinct) online users and more. |
| `/metrics` | `GET`       | **Prometheus-compatible endpoint**<br>Exposes the same stats as `/status` in addition to various Node.js performance figures. Available since HedgeDoc 1.8                               |
