# Release Checklist

- [ ] Security fixes (make sure all available undisclosed security fixes are merged)
- [ ] Bump the version
    - [ ] docs/content/dev/openapi.yml
        - version number image
    - [ ] docs/content/setup/manual-setup.md
        - `git clone` branch
        - `git checkout` branch
    - [ ] package.json
        - `version`
    - [ ]  public/docs/release-notes.md
        - version
        - date
        - text
- [ ] Update docker-compose in the docs
- [ ] Make sure `yarn.lock` is up to date
- [ ] Make sure translations are up to date
  - We use [poeditor_pull](https://github.com/costales/poeditor_pull) to download all language files from POEditor.

  1. change the following line in the script
  ```python
  -      r_lang = requests.post('https://api.poeditor.com/v2/projects/export', dict(api_token=project_api, id=project_id, language=lang['code'], type="po"))
  +      r_lang = requests.post('https://api.poeditor.com/v2/projects/export', dict(api_token=project_api, id=project_id, language=lang['code'], type="key_value_json"))
  ```
   2. run the script.
   3. update the json files in the `locales` directory.
      - any languages with 0% translations should not be included
- [ ] Exclude `.github folder`
- [ ] Write release notes
  - [ ] General description
  - [ ] Things requiring special action beside updating the software
  - [ ] New features
  - [ ] Bug fixes
  - [ ] Enhancements
  - [ ] Add all contributors
    - sort alphabetically
- [ ] Run the tests described in the release test document (internal)
- [ ] Upload tar ball to github and add a release tag
- [ ] Update container images
- [ ] Update website by running the ["deploy" workflow](https://github.com/hedgedoc/hedgedoc.github.io/actions?query=workflow%3A%22Deploy+to+github+actions+branch%22) in hedgedoc/hedgedoc.github.io
- [ ] Update [docs.hedgedoc.org](https://github.com/hedgedoc/docs.hedgedoc.org/actions/workflows/build.yml)

