# Guide - Setup HedgeDoc S3 image upload to Google Cloud Storage

HedgeDoc has no direct/native support for storing images in Google Cloud Storage Buckets. 
However since Google provides interoperability with S3, the S3 integration can be used. 

This guide will help you in getting things setup.

## Setup the bucket

### Create a bucket in Google Cloud Storage

1. Create a new bucket [within the Cloud Storage portal](https://console.cloud.google.com/storage/browser).
2. Give it a name, select the region and type of storage (e.g. multi dual-region)
3. In "Choose how to control access to objects" disable "Enforce public access prevention on this bucket"

### Open the bucket to the public

In order to view the images uploaded to HedgeDoc the storage bucket needs to be set to public.

1. Click the bucket you just created in [the Cloud Storage portal](https://console.cloud.google.com/storage/browser).
2. Go to the Permissions tab
3. Scroll down to the Permissions section
4. Click Grant Access
5. Add `allusers` as principal
6. Give it role `Storage Object Viewer` to allow it to retrieve the roles

### Setup interoperability & create Service Account

1. Go to the [interoperability tab](https://console.cloud.google.com/storage/settings;tab=interoperability) in the Google Cloud Console
2. Scroll down to "Access keys for service accounts" and click on "Create a key for a service account"
3. Select "Create new account"
4. Give it a name, e.g. `hedgedoc`
5. Select the `Storage Object Creator` role and select Add IAM Condition
6. Give it a name, e.g. `Restrict to bucket`
7. In Condition Builder:
    1. Condition type: Name
    2. Operator: Starts With
    3. Value: `projects/_/buckets/YOUR_BUCKET_NAME_HERE`
8. Skip the 3rd step (Grant users access to this service account)
9. Click done
10. Copy the Access Key and Secret to a text editor, we'll be using this later

### Add permissions

1. Go to [Roles](https://console.cloud.google.com/iam-admin/roles) within the IAM & Admin section in Google Cloud Console
2. Click Create Role
3. Give it a name (e.g. `Allow to view buckets`) and an id (e.g. `bucket-viewer`)
4. Click Add Permissions
5. In the filter (below the dropdown) type `storage.buckets.get`
6. Check the box in front of the `storage.buckets.get` entry, click Add.
7. Click Create

8. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam) section and go to the IAM page
9. Find the user we created in the previous step and edit it
10. Click "Add another role" and select the role we just created
11. Select the role we just created and select Add IAM Condition
12. Give it a name, e.g. `Restrict to bucket`
13. In Condition Builder:
    1. Condition type: Name
    2. Operator: Starts With
    3. Value: `projects/_/buckets/YOUR_BUCKET_NAME_HERE`
14. Save it.

## Configure HedgeDoc

In your `.env` file set:

```env
HD_MEDIA_BACKEND="s3"
HD_MEDIA_BACKEND_S3_ENDPOINT="https://storage.googleapis.com"
HD_MEDIA_BACKEND_S3_ACCESS_KEY="GOOG1EXXXXXXXXXX"
HD_MEDIA_BACKEND_S3_SECRET_KEY="XXXXXXXXXX"
HD_MEDIA_BACKEND_S3_BUCKET="your-bucket-name"
```

The access key and secret key are the values you received when you enabled the interoperability feature.

After restarting HedgeDoc you should now be able to add images to your pages.