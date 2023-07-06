# Building Docker images

To build docker images of the backend or frontend use the following commands.
Make sure that you have installed the [Docker BuildKit Plugin][buildkit] and
execute the commands from the root level of the project.
Otherwise, the build process may fail.

```sh
docker buildx build -f backend/docker/Dockerfile -t HedgeDoc-backend .
```

or

```sh
docker buildx build -f frontend/docker/Dockerfile -t HedgeDoc-frontend .
```

[buildkit]: https://docs.docker.com/build/install-buildx/
