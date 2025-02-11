# Documentation

Our documentation is build with [mkdocs][mkdocs]. While you can write documentation with every text
editor you like, if you want to build the documentation and want to see at how it will look you need
to have [python3][python3] and [mkdocs][mkdocs] installed.

## Writing

<!-- markdownlint-disable proper-names -->
All documentation files are found in the `docs/content` directory of
the [hedgedoc/hedgedoc repo](https://github.com/hedgedoc/hedgedoc). These files are just normal
markdown files with nothing special about them.
<!-- markdownlint-enable proper-names -->

The configuration for mkdocs lies in the `docs` folder in a file called `mkdocs.yml`. With that file
the theme and menu - among others - can be configured.
**Please note:** Any new files need to be linked to by other files or put in the navigation,
otherwise the files will be very hard to find on the documentation website.

## Building

To build the documentation locally you need to perform the following steps:

1. Make sure you have [python3][python3] installed. `python3 --version`
2. Go into the `docs` folder.
3. Install all the dependencies (E.g. with a [venv](https://docs.python.org/3/library/venv.html))
   with `pip install -r requirements.txt`
4. Start the mkdocs dev server (`mkdocs serve`) or build the documentation (`mkdocs build`).

If you run `mkdcs serve` a local server will serve the mkdocs files and change the served files as
you write documentation.

## Deployment

The documentation is deployed with [mkdocs][mkdocs].

<!-- markdownlint-disable proper-names -->
The repository [docs.hedgedoc.org][docs.hedgedoc.org] is used to deploy the actual website
to github.io. Currently only the `master` branch is deployed as it contains the latest release.
<!-- markdownlint-enable proper-names -->

[mkdocs]: https://www.mkdocs.org
[python3]: https://www.python.org/
[docs.hedgedoc.org]: https://github.com/hedgedoc/docs.hedgedoc.org
