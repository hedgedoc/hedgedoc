<!--
SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Using HedgeDoc with Docker

**Important:** This README does **not** refer to HedgeDoc 1. For setting up HedgeDoc 1 with Docker, see https://docs.hedgedoc.org/setup/docker/.

The `Dockerfile` in this repo uses multiple stages and can be used to create both images for development
and images with only production dependencies.
It uses features which are only available in BuildKit - see https://docs.docker.com/go/buildkit/ for more information.

## Build a production image
**Note:** This does not include any frontend!

To build a production image, run the following command *from the root of the repository*:  
`docker buildx build -t hedgedoc-prod -f backend/docker/Dockerfile .`

When you run the image, you need to provide environment variables to configure HedgeDoc.
See [the config docs](../../docs/content/config/index.md) for more information.
This example starts HedgeDoc on localhost, with non-persistent storage:  
`docker run -e HD_BASE_URL=http://localhost -e HD_MEDIA_BACKEND=filesystem -e HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH=uploads -e HD_DATABASE_TYPE=sqlite -e HD_DATABASE_NAME=hedgedoc.sqlite -e HD_SESSION_SECRET=foobar -e HD_LOGLEVEL=debug -p 3000:3000 hedgedoc-prod`


## Build a development image
You can build a development image using the `development` target:  
`docker buildx build -t hedgedoc-dev -f backend/docker/Dockerfile --target development .`

You can then, e.g. run tests inside the image:  
`docker run hedgedoc-dev yarn run test:e2e`
