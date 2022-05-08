# URL scheme

HedgeDoc has three different modes for viewing a stored note. Each mode has a slightly different URL for accessing it. This document gives an overview about these URLs.  
We assume that you replace `pad.example.com` with the domain of your instance.

## Default (random)

When you create a new note by clicking the "New note" button, your note is given a long random id and a random short-id. The long id is needed for accessing the editor and the live-update view. The short-id is used for the "published" version of a note that is read-only and does not update in realtime as well as for the presentation mode.

| example URL                            | prefix | mode              | content updates |
| -------------------------------------- | ------ | ----------------- | --------------- |
| pad.example.com/Ndmv3oCyREKZMjSGR9uhnQ | *none* | editor            | in realtime     |
| pad.example.com/s/ByXF7k-YI            | s/     | read-only version | on reload       |
| pad.example.com/p/ByXF7k-YI            | p/     | presentation mode | on reload       |

## FreeURL mode

If the setting `CMD_ALLOW_FREEURL` is enabled, users may create notes with a custom alias URL by just visiting the editor version of a custom alias. The published version and the presentation mode may also be accessed with the custom alias.

| example URL                       | prefix | mode              | content updates |
| --------------------------------- | ------ | ----------------- | --------------- |
| pad.example.com/my-awesome-note   | *none* | editor            | in realtime     |
| pad.example.com/s/my-awesome-note | s/     | read-only version | on reload       |
| pad.example.com/p/my-awesome-note | p/     | presentation mode | on reload       |

## Different editor modes

The editor has three different sub-modes. All of these update the content in realtime.

| example URL                     | icon in the navbar | behaviour                                       |
| ------------------------------- | -------------------| ----------------------------------------------- |
| pad.example.com/longnoteid?edit | pencil             | Full-screen markdown editor for the content     |
| pad.example.com/longnoteid?view | eye                | Full-screen view of the note without the editor |
| pad.example.com/longnoteid?both | columns            | markdown editor and view mode side-by-side      |
