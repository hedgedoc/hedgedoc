Authentication guide - SAML
===

**Note:** *This guide was written before the renaming. Just replace `HackMD` with `CodiMD` in your mind :smile: thanks!*

The basic procedure is the same as the case of OneLogin which is mentioned in [OneLogin-Guide](./saml-onelogin.md). If you want to match your IdP, you can use more configurations as below.

* If your IdP accepts metadata XML of the service provider to ease configuration, use this url to download metadata XML.
    * {{your-serverurl}}/auth/saml/metadata
    * _Note: If not accessible from IdP, download to local once and upload to IdP._
* Change the value of `issuer`, `identifierFormat` to match your IdP.
  * `issuer`: A unique id to identify the application to the IdP, which is the base URL of your CodiMD as default
  * `identifierFormat`: A format of unique id to identify the user of IdP, which is the format based on email address as default. It is recommend that you use as below.
    * urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress (default)
    * urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
  * `config.json`:
    ```javascript
    {
      "production": {
        "saml": {
          /* omitted */
          "issuer": "mycodimd"
          "identifierFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"
        }
      }
    }
    ```
  * environment variables
    ```
    CMD_SAML_ISSUER=mycodimd
    CMD_SAML_IDENTIFIERFORMAT=urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
    ```

* Change mapping of attribute names to customize the displaying user name and email address to match your IdP.
  * `attribute`: A dictionary to map attribute names
  * `attribute.id`: A primary key of user table for your CodiMD
  * `attribute.username`: Attribute name of displaying user name on CodiMD
  * `attribute.email`: Attribute name of email address, which will be also used for Gravatar
    * _Note: Default value of all attributes is NameID of SAML response, which is email address if `identifierFormat` is default._
  * `config.json`:
    ```javascript
    {
      "production": {
        "saml": {
          /* omitted */
          "attribute": {
            "id": "sAMAccountName",
            "username": "displayName",
            "email": "mail"
          }
        }
      }
    }
    ```
  * environment variables
    ```sh
    CMD_SAML_ATTRIBUTE_ID=sAMAccountName
    CMD_SAML_ATTRIBUTE_USERNAME=nickName
    CMD_SAML_ATTRIBUTE_EMAIL=mail
    ```

* If you want to control permission by group membership, add group attribute name and required group (allowed) or external group (not allowed).
  * `groupAttribute`: An attribute name of group membership
  * `requiredGroups`: Group names array for allowed access to CodiMD. Use vertical bar to separate for environment variables.
  * `externalGroups`: Group names array for not allowed access to CodiMD. Use vertical bar to separate for environment variables.
    * _Note: Evaluates `externalGroups` first_
  * `config.json`:
    ```javascript
    {
      "production": {
        "saml": {
          /* omitted */
          "groupAttribute": "memberOf",
          "requiredGroups": [ "codimd-users", "board-members" ],
          "externalGroups": [ "temporary-staff" ]
        }
      }
    }
    ```
  * environment variables
    ```sh
    CMD_SAML_GROUPATTRIBUTE=memberOf
    CMD_SAML_REQUIREDGROUPS=codimd-users|board-members
    CMD_SAML_EXTERNALGROUPS=temporary-staff
    ```
