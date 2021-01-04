# Documentation

Our documentation is build with [mkdocs](https://www.mkdocs.org).

## Writing

All documentation files are found in the `docs/content` directory of the [hedgedoc/hedgedoc repo](https://github.com/hedgedoc/hedgedoc). These files are just normal markdown files with nothing special about them.

The configuration for mkdocs lies in the `docs` folder in a file called `mkdocs.yml`. With that file the theme and menu - amoung others - can be configured.
**Please note:** Any new files need to be linked to by other files or put in the navigation or the files will be very hard to find on the documentation website.

## Building

To build the documentation locally you need to perform the following steps:

0. Make sure you have python3 installed.
1. Go into the `docs` folder.
2. Install all the dependencies (E.g. with a [venv](https://docs.python.org/3/library/venv.html)) with `pip install -r requirements.txt`
3. Start the mkdocs dev server (`mkdocs serve`) or build the documentation (`mkdocs build`).

## Deployment

The documentation is deployed with [Messor Structor](https://github.com/traefik/structor).

The necessary Dockerfile and version menu template and also the github action to build the whole documentation can be found in the [docs.hedgedoc.org repo](https://github.com/hedgedoc/docs.hedgedoc.org). This repo is also used to deploy the actuall website to github.io.

Messor Structor builds and deploys the documentation by finding all branches that follow the pattern `v*`. For each branch the docs are generated separately by first installing the dependencies from `requirements.txt` and then running mkdocs. Afterwards the menu go template is used to include a version switcher in the theme.
