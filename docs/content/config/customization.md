# Customization

HedgeDoc allows you to set a name or logo for your organization.
How this looks and where this is used, can be seen below.
You can also provide a privacy policy, terms of use or an imprint url
for your HedgeDoc instance.

| environment variable  | default | example                           | description                                                                                                                                                             |
| --------------------- | ------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HD_CUSTOM_NAME`      | -       | `DEMO Corp`                       | The text will be shown in the top right corner in the editor and on the intro page. If you also configure a custom logo, this will be used as the alt text of the logo. |
| `HD_CUSTOM_LOGO`      | -       | `https://md.example.com/logo.png` | The logo will be shown in the top right corner in the editor and on the intro page.                                                                                     |
| `HD_PRIVACY_URL`      | -       | `https://md.example.com/privacy`  | The URL that should be linked as the privacy notice in the footer.                                                                                                      |
| `HD_TERMS_OF_USE_URL` | -       | `https://md.example.com/terms`    | The URL that should be linked as the terms of user in the footer.                                                                                                       |
| `HD_IMPRINT_URL`      | -       | `https://md.example.com/imprint`  | The URL that should be linked as the imprint in the footer.                                                                                                             |

## Example

### Links

![Links on the Frontpage][links-frontpage]
*links for the privacy policy, terms of use and imprint on the front page*

### Logo

For this demo we use this image:  
![The demo logo][demo-logo]

![The demo logo on the Frontpage][logo-front-page]  
*logo used on the front page*

![The demo logo in the editor (light)][logo-editor-light]
![The demo logo in the editor (dark)][logo-editor-dark]  
*logo used in the editor*

### Name

For this demo we use the name `DEMO Corp`

![The name on the Frontpage][name-front-page]  
*name used on the front page*

![The name in the editor (light)][name-editor-light]
![The name in the editor (dark)][name-editor-dark]
*name used in the editor*

[links-frontpage]: ../../images/customization/links.png
[demo-logo]: ../../images/customization/demo_logo.png
[logo-front-page]: ../../images/customization/logo/frontpage.png
[logo-editor-light]: ../../images/customization/logo/editor_light.png
[logo-editor-dark]: ../../images/customization/logo/editor_dark.png
[name-front-page]: ../../images/customization/name/frontpage.png
[name-editor-light]: ../../images/customization/name/editor_light.png
[name-editor-dark]: ../../images/customization/name/editor_dark.png
