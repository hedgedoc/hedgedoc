# Azure Blob Storage

You can use [Microsoft Azure Blob Storage][azure] to handle your image uploads in HedgeDoc.

All you need to do is to get the [connection string][connection-string] for your storage account
and create a storage container with public access set to 'blob'.

It's possible to create the container with the [Azure CLI][azure-cli], using your connection string,
with the following command:

<!-- markdownlint-disable line-length -->
```shell
az storage container create --name <NAME> --public-access blob--connection-string "<CONNECTION_STRING>"
```
<!-- markdownlint-enable line-length -->

You can of course also create the container in the Azure portal if you prefer.

Then you just add the following lines to your configuration:  
(with the appropriate substitution for `<CONNECTION_STRING>` and `<NAME>` of course)

```dotenv
HD_MEDIA_BACKEND="azure"
HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING="<CONNECTION_STRING>"
HD_MEDIA_BACKEND_AZURE_CONTAINER="<NAME>"
```

[azure]: https://azure.microsoft.com/services/storage/blobs/
[connection-string]: https://docs.microsoft.com/azure/storage/common/storage-account-keys-manage
[azure-cli]: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
