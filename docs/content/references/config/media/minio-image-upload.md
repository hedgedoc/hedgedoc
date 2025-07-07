# MinIO Guide for HedgeDoc

This guide will help you set up MinIO as a storage backend for HedgeDoc image uploads.

> **Note:** The screenshots in this guide are placeholders and need to be replaced with actual screenshots of the MinIO Console interface.

## Setting up MinIO

1. First, you need to set up MinIO itself.

   Please refer to the [official MinIO docs](https://min.io/docs/minio/linux/index.html) for a production setup.

   For testing and development purposes, a non-persistent setup is enough:
   ```sh
   docker run --name test-minio --rm -d -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
   ```

   *Please note this is not for productive use as all your data will be lost when you stop this container*

2. Next, get the credentials from the container:

   ```sh
   docker logs test-minio
   ```

   Look for lines containing the access and secret keys:
   ```
   AccessKey: minioadmin
   SecretKey: minioadmin
   ```

   Note: In newer MinIO versions, the default credentials are `minioadmin` / `minioadmin` if not specified otherwise.

3. Open the MinIO Console at <http://localhost:9001> and login with the credentials.

   ![MinIO Console Login](../../../images/minio-image-upload/console-login.png)

4. Create a bucket for HedgeDoc:

   - Click on "Buckets" in the left sidebar
   - Click the "Create Bucket +" button
   - Enter a name for your bucket (e.g., "hedgedoc")
   - Click "Create Bucket"

   ![Create Bucket](../../../images/minio-image-upload/create-bucket.png)

5. Configure access policy for the bucket:

   - Click on the bucket you just created
   - Click on "Manage" in the top right
   - Select "Access Policy" from the dropdown
   - Click "Add New Policy"
   - Set the following:
     - Policy Name: `uploads-readonly`
     - Prefix: `uploads`
     - Access: `readonly`
   - Click "Save"

   ![Add Policy](../../../images/minio-image-upload/add-policy.png)

6. Configure HedgeDoc to use MinIO:

   Add the following to your HedgeDoc configuration:

   ```dotenv
   HD_MEDIA_BACKEND="s3"
   HD_MEDIA_BACKEND_S3_ACCESS_KEY="<ACCESS_KEY>"
   HD_MEDIA_BACKEND_S3_SECRET_KEY="<SECRET_KEY>"
   HD_MEDIA_BACKEND_S3_BUCKET="hedgedoc"
   HD_MEDIA_BACKEND_S3_ENDPOINT="http://localhost:9000"
   HD_MEDIA_BACKEND_S3_REGION=""
   HD_MEDIA_BACKEND_S3_PATH_STYLE="true"
   ```

   Replace `<ACCESS_KEY>` and `<SECRET_KEY>` with your MinIO credentials.

   *Note: For a production setup, you'll need to use different values for the endpoint. The endpoint address must be publicly accessible from your users' browsers.*

7. Restart HedgeDoc and test image uploads.

## Migrating from filesystem storage

If you were previously using filesystem storage and want to migrate your assets to MinIO, you can use the convenience script located in `bin/migrate_from_fs_to_minio`.

Be careful and read what the script does before running it. It may not work in all environments. Consider it as inspiration for creating your own migration script.

## Troubleshooting

- **Images not showing after upload**: Make sure your MinIO endpoint is accessible from your users' browsers. The endpoint URL is used directly by the browser to fetch images.
- **Upload errors**: Check that the bucket exists and that the access credentials are correct.
- **CORS errors**: You may need to configure CORS settings in MinIO to allow requests from your HedgeDoc domain.