# Permissions

HedgeDoc 1.x uses a basic permission system that differentiates between the owner of a note (the account who initially
created it), logged-in users and guests.

It is possible to change the access permission of a note through the little button on the top right of the view pane
in the editor. However, only the note owner can change the permission of a note.

The permissions are named **Freely**, **Editable**, **Limited**, **Locked**, **Protected** and **Private**.

You can configure the default permission for new notes using the `defaultPermission` option in the `config.json` file or
`CMD_DEFAULT_PERMISSION` environment variable.

For more information, see the [configuration documentation](../configuration.md#users-and-privileges).

|                                                                                   |   Permission   | Owner read/write | Signed-in read | Signed-in write | Guest read | Guest write |
|:---------------------------------------------------------------------------------:|:--------------:|:----------------:|:--------------:|:---------------:|:----------:|:-----------:|
|     <img src="/images/icons/leaf.svg" alt="leaf icon" height="16" width="16">     |   **Freely**   |        ✔         |       ✔        |        ✔        |     ✔      |      ✔      |
|   <img src="/images/icons/pencil.svg" alt="pencil icon" height="16" width="16">   |  **Editable**  |        ✔         |       ✔        |        ✔        |     ✔      |      ✖      |
|  <img src="/images/icons/id-card.svg" alt="id card icon" height="16" width="16">  |  **Limited**   |        ✔         |       ✔        |        ✔        |     ✖      |      ✖      |
|     <img src="/images/icons/lock.svg" alt="lock icon" height="16" width="16">     |   **Locked**   |        ✔         |       ✔        |        ✖        |     ✔      |      ✖      |
| <img src="/images/icons/umbrella.svg" alt="umbrella icon" height="16" width="16"> | **Protected**  |        ✔         |       ✔        |        ✖        |     ✖      |      ✖      |
| <img src="/images/icons/hand-paper-o.svg" alt="hand icon" height="16" width="16"> |  **Private**   |        ✔         |       ✖        |        ✖        |     ✖      |      ✖      |
