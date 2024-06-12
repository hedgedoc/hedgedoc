# Media

!!! info "Design Document"
    This is a design document, explaining the design and vision for a HedgeDoc 2
    feature. It is not a user guide and may or may not be fully implemented.

Media is the term for uploads associated with a note in HedgeDoc.
Currently, there's only support for images.

Media files can be saved to different storage backends like the local filesystem, S3, Azure Blob
storage, generic WebDAV shares, or imgur.
Each storage backend needs to implement an interface with three methods:

- `saveFile(uuid, buffer, fileType)` should store a given file and may return stringified metadata
  to store in the database for this upload. The metadata does not need to follow a specific format,
  and will only be used inside the storage backend.
- `deleteFile(uuid, metadata)` should delete a file with the given UUID. The stored metadata can
  be used for example to identify the file on the storage platform.
- `getFileUrl(uuid, metadata)` should return a URL to the file with the given UUID. The stored
  metadata can be used to identify the file on the storage platform.
  The returned URL may be temporary.

Uploads are checked for their MIME type and compared to an allow-list and if not matching rejected.
