# Downloaded from https://raw.githubusercontent.com/codimd/container/master/debian/Dockerfile

FROM node:12.13.0

# Build arguments to change source url, branch or tag
#ARG CODIMD_REPOSITORY=https://github.com/codimd/server.git
#ARG VERSION=master
ARG UID=10000

# Set some default config variables
ENV DEBIAN_FRONTEND noninteractive
ENV DOCKERIZE_VERSION v0.6.1
ENV NODE_ENV=production

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV GOSU_VERSION 1.11
COPY resources/gosu-gpg.key /tmp/gosu.key
RUN set -ex; \
    dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
    wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
    wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
    \
# verify the signature
    export GNUPGHOME="$(mktemp -d)"; \
    gpg --no-tty --import /tmp/gosu.key; \
    gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
    rm -rf "$GNUPGHOME" /usr/local/bin/gosu.asc; \
    \
    chmod +x /usr/local/bin/gosu; \
# verify that the binary works
    gosu nobody true

# Add configuraton files
COPY resources/config.json resources/.sequelizerc /files/

RUN apt-get update && \
    apt-get install -y git build-essential jq && \
    # Add fonts for PDF export
    apt-get install -y fonts-noto


ADD . /codimd
WORKDIR /codimd

    ## Clone the source
    #git clone --depth 1 --branch "$VERSION" "$CODIMD_REPOSITORY" /codimd && \
    ## Print the cloned version and clean up git files
    #cd /codimd && \
    #git log --pretty=format:'%ad %h %d' --abbrev-commit --date=short -1 && echo && \
    #git rev-parse HEAD > /tmp/gitref && \
    #rm -rf /codimd/.git && \

    ## Mime the git repository for fullversion
    #mkdir /codimd/.git && \
    #mv /tmp/gitref /codimd/.git/HEAD && \
    #jq ".repository.url = \"${CODIMD_REPOSITORY}\"" /codimd/package.json > /codimd/package.new.json && \
    #mv /codimd/package.new.json /codimd/package.json && \

    # Symlink configuration files
RUN    rm -f /codimd/config.json && ln -s /files/config.json /codimd/config.json && \
    rm -f /codimd/.sequelizerc && ln -s /files/.sequelizerc /codimd/.sequelizerc && \

    # Install NPM dependencies and build project
    yarn install --pure-lockfile && \
    yarn install --production=false --pure-lockfile && \
    npm run build && \

    # Clean up this layer
    yarn install && \
    yarn cache clean && \
    apt-get remove -y --auto-remove build-essential git jq && \
    apt-get clean && apt-get purge && rm -r /var/lib/apt/lists/* && \
    # Create codimd user
    adduser --uid $UID --home /codimd/ --disabled-password --system codimd && \
    chown -R codimd /codimd/

WORKDIR /codimd
EXPOSE 3000

COPY resources/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD ["node", "app.js"]
