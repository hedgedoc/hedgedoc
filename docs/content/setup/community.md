# Community Installation Methods

The HedgeDoc community has created and tested many options for deploying HedgeDoc on other platforms or operating systems.
You can check them out below. Feel free to create a PR to add your tested community installation method.

These are not officially supported by the HegeDoc maintainers. If you encounter issues or have questions, please first reach out to downstream packagers.

## Container Deployments

### LinuxServer.io Docker Image

[![Discord](https://img.shields.io/discord/354974912613449730.svg?color=94398d&labelColor=555555&logoColor=ffffff&style=for-the-badge&label=Discord&logo=discord)](https://discord.gg/YWrKVTn "realtime support / chat with the community and the team.")
[![GitHub Release](https://img.shields.io/github/release/linuxserver/docker-hedgedoc.svg?color=94398d&labelColor=555555&logoColor=ffffff&style=for-the-badge&logo=github)](https://github.com/linuxserver/docker-hedgedoc/releases)

[LinuxServer.io](https://linuxserver.io) have created an Alpine-based multi-arch container image for x86-64, arm64 and armhf.

- It supports all the environment variables detailed in the [configuration documentation](../configuration.md) to modify it according to your needs.
- It gets rebuilt on new releases from HedgeDoc and also weekly if necessary to update any other package changes in the underlying container, making it easy to keep your HedgeDoc instance up to date.
- It also details how to easily [utilize Docker networking to reverse proxy](https://github.com/linuxserver/docker-hedgedoc/#application-setup) HedgeDoc using their [SWAG docker image](https://github.com/linuxserver/docker-swag)

In order to contribute check the LinuxServer.io [GitHub repository](https://github.com/linuxserver/docker-hedgedoc/) for HedgeDoc.
And to find all tags and versions of the image, check the [Docker Hub repository](https://hub.docker.com/r/linuxserver/hedgedoc).


### Helm Chart

You can deploy HedgeDoc on your Kubernetes cluster using `helm`.

[HedgeDoc Helm Chart by nicholaswilde on Artifact Hub](https://artifacthub.io/packages/helm/nicholaswilde/hedgedoc)  
[Website](https://nicholaswilde.github.io/helm-charts/)  
[Source Code](https://github.com/nicholaswilde/helm-charts/tree/main/charts/hedgedoc)

## One-click Installer

### Heroku

You can quickly setup a sample Heroku HedgeDoc application by clicking the button
below.

[![Deploy on Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/hedgedoc/hedgedoc/tree/master)

### YunoHost

HedgeDoc is available as a 1-click install on [YunoHost](https://yunohost.org/).  YunoHost is a Debian GNU/Linux based distribution packaged with free software that automates the installation of a personal web server.

[![Install HedgeDoc with YunoHost](https://install-app.yunohost.org/install-with-yunohost.svg)](https://install-app.yunohost.org/?app=hedgedoc)

The source code for the package can be found [here](https://github.com/YunoHost-Apps/hedgedoc_ynh).

### Cloudron

HedgeDoc is available as a 1-click install on [Cloudron](https://cloudron.io).  Cloudron makes it easy to run apps like HedgeDoc on your server and keep them up-to-date and secure.

[![Install](https://cloudron.io/img/button.svg)](https://cloudron.io/button.html?app=io.hackmd.cloudronapp)

The source code for the package can be found [here](https://git.cloudron.io/cloudron/codimd-app).

There is a [demo instance](https://my.demo.cloudron.io) (username: cloudron password: cloudron) where
you can experiment with running HedgeDoc.

### PikaPods

[PikaPods](https://www.pikapods.com/) offers simple hosting for open source apps. Run HedgeDoc within seconds
using the button below. This will run the official Docker image from [quay.io](https://quay.io/repository/hedgedoc/hedgedoc).

[![Run on PikaPods](https://www.pikapods.com/static/run-button.svg)](https://www.pikapods.com/pods?run=hedgedoc)

### SelfPrivacy

HedgeDoc is available as a 1-click install on [SelfPrivacy](https://selfprivacy.org/). SelfPrivacy app allows you to set up self-hosted services on your automatically configured and managed NixOS-based server. Because HedgeDoc is officialy supported by SelfPrivacy, all you need to do is add it from the Services catalog on the Services page.

The source code of the module can be found [here](https://git.selfprivacy.org/SelfPrivacy/selfprivacy-nixos-config/src/branch/flakes/sp-modules/hedgedoc).

[Install SelfPrivacy](https://selfprivacy.org/download/)

## Distribution Packages

### Arch Linux

HedgeDoc is available in the Arch Linux _community_ repository.

[Link to the package](https://archlinux.org/packages/community/any/hedgedoc/)

### FreeBSD

HedgeDoc is available in the FreeBSD _ports_ repository. After installation, customise your `config.json` file, referring to the official HedgeDoc documentation.

[Ports Repository](https://freshports.org/www/hedgedoc)
