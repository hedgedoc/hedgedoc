# WebDAV

You can use any [WebDAV][webdav] server to handle your image uploads in HedgeDoc.

The WebDAV server must host the files in a way that allows HedgeDoc to request and receive them.

You just add the following lines to your configuration:  
(with the appropriate substitution for `<CONNECTION_STRING>`,
`<UPLOAD_DIR>`, and `<PUBLIC_URL>` of course)

```dotemv
HD_MEDIA_BACKEND="webdav"
HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING="<CONNECTION_STRING>"
HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR="<UPLOAD_DIR>"
HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL="<PUBLIC_URL>"
```

The `<CONNECTION_STRING>` should include the username and password (if needed)
in the familiar way of `schema://user:password@url`.

With `<UPLOAD_DIR>` you can specify a folder you want to upload to,
but you can also omit this (just don't spcify this value at all),
if you prefer to upload directly to the root of the WebDAV server.

Finally, `<PUBLIC_URL>` specifies with which url HedgeDoc can access the upload. For this purpose
the filename will be appended to `<PUBLIC_URL>`. So the file `test.png` with `<PUBLIC_URL>`
`https://dav.example.com` should be accessible via `https://dav.example.com/test.png`.

## Using Nextcloud

If you want to use Nextcloud as a WebDAV server, follow the following instructions:

This guide was written using Nextcloud 21 in April 2021.

Because the username and app password will be included in the config, we suggest using
a dedicated Nextcloud user for the uploads.

In this example the username will be `TestUser`.

1. Create an app password by going to `Settings` > `Security`. Nextcloud will generate a password
   for you. Let's assume it's `passw0rd`.
2. In the Files app [create a new folder][nextcloud-folder] that will hold
   your uploads (e.g `HedgeDoc`).
3. [Share][nextcloud-share] the newly created folder. The folder should (per default) be configured
   with the option `Read Only` (which we will assume in this guide), but
   `Allow upload and editing` should be fine, too.
4. Get the public link of the share. It should be in your clipboard after creation. If not you
   can copy it by clicking the clipboard icon at the end of the line of `Share link`. We'll assume
   it is `https://cloud.example.com/s/some-id` in the following.
5. Append `/download?path=%2F&files=` to this URL. To continue with our example
   the url should now be `https://cloud.example.com/s/some-id/download?path=%2F&files=`.
6. Get the [WebDAV url of you Nextcloud server][nextcloud-webdav]. It should be located in the
   Files app in the bottom left corner under `Settings` > `WebDAV`. We'll assume it is
   `https://cloud.example.com/remote.php/dav/files/TestUser/` in the following.
7. Add your login information to the link. This is done by adding `username:password@` in between
   the url schema (typically `https://`) and the rest of the url
   (`cloud.example.com/remote.php/dav/files/TestUser/` in our example). The WebDAV url in our
   example should now look like this
   `https://TestUser:passw0rd@cloud.example.com/remote.php/dav/files/TestUser/`.
8. Configure HedgeDoc:

```dotenv
HD_MEDIA_BACKEND="webdav"
HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING="https://TestUser:passw0rd@cloud.example.com/remote.php/dav/files/TestUser/"
HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR="HedgeDoc"
HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL="https://cloud.example.com/s/some-id/download?path=%2F&files="
```

Start using image uploads backed by Nextclouds WebDAV server.

[webdav]: https://en.wikipedia.org/wiki/WebDAV
[nextcloud-folder]: https://docs.nextcloud.com/server/latest/user_manual/en/files/access_webgui.html#creating-or-uploading-files-and-directories
[nextcloud-share]: https://docs.nextcloud.com/server/latest/user_manual/en/files/sharing.html#public-link-shares
[nextcloud-webdav]: https://docs.nextcloud.com/server/latest/user_manual/en/files/access_webdav.html
