# Minio Guide for HedgeDoc

**Note:** *This guide was written before the renaming. Just replace `HackMD` with `HedgeDoc` in your mind 😃 thanks!*

1. First of all you need to setup Minio itself.

   Please refer to the [official Minio docs](https://docs.minio.io/) for an
   production setup.

   For checking it out and development purposes a non-persistent setup is enough:
   ```sh
   docker run --name test-minio --rm -d -p 9000:9000 minio/minio server /data
   ```

   *Please notice this is not for productive use as all your data gets lost
   when you stop this container*

2. Next step is to get the credentials form the container:

   ```sh
   docker logs test-minio
   ```

   ![docker logs](../images/minio-image-upload/docker-logs.png)

3. Open <http://localhost:9000> and login with the shown credentials.

   ![minio default view](../images/minio-image-upload/default-view.png)

4. Create a bucket for HedgeDoc

   ![minio create bucket](../images/minio-image-upload/create-bucket.png)

5. Add a policy for the prefix `uploads` and make it read-only.

   ![minio edit policy](../images/minio-image-upload/open-edit-policy.png)
   *Open policy editor*

   ![minio policy adding](../images/minio-image-upload/create-policy.png)
   *Add policy for uploads*

6. Set credentials and configs for Minio in HedgeDoc's `config.json`

   ```JSON
   "minio": {
     "accessKey": "888MXJ7EP4XXXXXXXXX",
     "secretKey": "yQS2EbM1Y6IJrp/1BUKWq2/XXXXXXXXXXXXXXX",
     "endPoint": "localhost",
     "port": 9000,
     "secure": false
   }
   ```
   *You have to use different values for `endpoint` and `port` for a production
   setup. Keep in mind the `endpoint`-address has to be public accessible from
   your browser.*

7. Set bucket name

   ```JSON
   "s3bucket": "hedgedoc"
   ```

8. Set upload type.

   ```JSON
   "imageuploadtype": "minio"
   ```

9. Review your config.

   ```json
   {
     // all your other config…
     "minio": {
       "accessKey": "888MXJ7EP4XXXXXXXXX",
       "secretKey": "yQS2EbM1Y6IJrp/1BUKWq2/XXXXXXXXXXXXXXX",
       "endPoint": "localhost",
       "port": 9000,
       "secure": false
     },
     "s3bucket": "hedgedoc",
     "imageuploadtype": "minio"
   }
   ```

10. If you were using filesystem before

and you want to migrate assets to minio.

You could use a convenience script located in `bin/migrate_from_fs_to_minio`.

Be careful, read carefully what it does, it was not tested in all environments.

Take it as an inspiration to make your own migration script.
