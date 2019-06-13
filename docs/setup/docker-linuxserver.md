LinuxServer.io CodiMD Image
===
[![](https://img.shields.io/discord/354974912613449730.svg?logo=discord&label=LSIO%20Discord&style=flat-square)](https://discord.gg/YWrKVTn)[![](https://images.microbadger.com/badges/version/linuxserver/codimd.svg)](https://microbadger.com/images/linuxserver/codimd "Get your own version badge on microbadger.com")[![](https://images.microbadger.com/badges/image/linuxserver/codimd.svg)](https://microbadger.com/images/linuxserver/codimd "Get your own version badge on microbadger.com")![Docker Pulls](https://img.shields.io/docker/pulls/linuxserver/codimd.svg)![Docker Stars](https://img.shields.io/docker/stars/linuxserver/codimd.svg)[![Build Status](https://ci.linuxserver.io/buildStatus/icon?job=Docker-Pipeline-Builders/docker-codimd/master)](https://ci.linuxserver.io/job/Docker-Pipeline-Builders/job/docker-codimd/job/master/)[![](https://lsio-ci.ams3.digitaloceanspaces.com/linuxserver/codimd/latest/badge.svg)](https://lsio-ci.ams3.digitaloceanspaces.com/linuxserver/codimd/latest/index.html)

[LinuxServer.io](https://linuxserver.io) have created an Ubuntu based multiarch container for x86-64, arm64 and armhf which supports PDF export from all architectures using PhatomJS. 

It supports all the environmental variables detailed [here](https://github.com/codimd/server/blob/master/docs/configuration-env-vars.md) to modify it according to your needs.

It gets rebuilt on new releases from CodiMD and also weekly if necessary to update any other package changes in the underlying container, making it easy to keep your CodiMD instance up to date.

It also details how to easily [utilise Docker networking to reverse proxy](https://github.com/linuxserver/docker-codimd/#application-setup) CodiMD using their [LetsEncrypt docker image](https://github.com/linuxserver/docker-letsencrypt)

[Github Repository](https://github.com/linuxserver/docker-codimd/)
[Docker Hub Image](https://hub.docker.com/r/linuxserver/codimd)