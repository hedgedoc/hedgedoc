# Managing Notes

## Image Upload

You can upload an image simply by clicking on the upload button <i class="fa fa-upload"></i>.
Alternatively, you can **drag-n-drop** an image into the editor. Even **pasting** images is possible!
This will automatically upload the image to **[imgur](https://imgur.com)**, **[Amazon S3](https://aws.amazon.com/s3/)**, **[Minio](https://minio.io)** or the **local filesystem** (depending on the instance's configuration), nothing to worry about. :tada:

![imgur](https://i.imgur.com/9cgQVqD.png)

## Share Notes

If you want to share an **editable** note, just copy the URL.
If you want to share a **read-only** note, simply press the publish button <i class="fa fa-share-square-o"></i> and copy the URL.

## Save a Note

Currently, you can save to **Dropbox** <i class="fa fa-dropbox"></i> (depending on the instance's configuration) or save a Markdown <i class="fa fa-file-text"></i>, HTML or raw HTML <i class="fa fa-file-code-o"></i> file locally.

## Import Notes

Similarly to the *save* feature, you can also import a Markdown file from **Dropbox** <i class="fa fa-dropbox"></i> (depending on the instance's configuration), or import content from your **clipboard** <i class="fa fa-clipboard"></i>, which can parse some HTML. :smiley:

## Permissions

It is possible to change the access permission of a note through the little button on the top right of the view.
For more details, see [Permissions](../references/permissions.md).

## Revisions

When changes are made to a note previous versions of the note are stored as `Revisions`, if you ever need to return to a previous save you can find all the note revisions by going to `Menu` -> `Revision`.

The note history on the left displays each revision with a timestamp allowing you to quickly select a revision on the left will display the revised note to the right, the revision will display the changes made with colorization to indicate additions/removals.

In addition to browsing the revisions, you can download a selected note revision or revert the current note to the selected revision.
