# Building Docker images

To build Docker images of the backend or frontend use the following commands.
Make sure that you have installed the [Docker BuildKit Plugin][buildkit] and
execute the commands from the root level of the project.
Otherwise, the build process may fail.

<!-- markdownlint-disable proper-names -->
```shell
docker buildx build -f backend/docker/Dockerfile -t hedgedoc-backend .
```
<!-- markdownlint-enable proper-names -->

or

<!-- markdownlint-disable proper-names -->
```shell
docker buildx build -f frontend/docker/Dockerfile -t hedgedoc-frontend .
```
<!-- markdownlint-enable proper-names -->

[buildkit]: https://docs.docker.com/build/install-buildx/
