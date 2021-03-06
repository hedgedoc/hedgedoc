# Imgur

You can use [Imgur](https://imgur.com) to handle your image uploads in HedgeDoc.

All you need for that is to register an application with Imgur and get a client id:

1. Create an account on imgur.com and log in.
2. Go to <https://api.imgur.com/oauth2/addclient>
3. Fill out the form and choose "Anonymous usage without user authorization" as the authorization type.
4. Imgur will then show you your client id.

Then you just add the following lines to your configuration:  
<small>(with the appropriate substitution for `<IMGUR_CLIENT_ID>` of course)</small>
```
HD_MEDIA_BACKEND="imgur"
HD_MEDIA_BACKEND_IMGUR_CLIENT_ID="<IMGUR_CLIENT_ID>"
```

All uploads are saved in the `media_uploads` database table and contain the deletion token ([see here](https://apidocs.imgur.com/#949d6cb0-5e55-45f7-8853-8c44a108399c)) in the column `backendData`.
