# Filesystem

You can use your local filesystem to handle your image uploads in HedgeDoc.

You just add the following lines to your configuration:  
<small>(with the appropriate substitution for `<DIRECTORY>` of course)</small>
```
HD_MEDIA_BACKEND="filesystem"
HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH="<DIRECTORY>"
```

Please make sure that the user that runs HedgeDoc is able to write to the `uploads` directory. 
