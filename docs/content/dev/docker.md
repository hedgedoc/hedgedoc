# Building Docker images

To build docker images of the backend or frontend use the following commands.
Make sure that you have installed the [Docker BuildKit Plugin](https://docs.docker.com/build/install-buildx/) and
execute the commands from the root level of the project.
Otherwise, the build process may fail.

```sh
docker buildx build -f backend/docker/Dockerfile -t hedgedoc-backend .
```

or

```sh
docker buildx build -f frontend/docker/Dockerfile -t hedgedoc-frontend .
```



