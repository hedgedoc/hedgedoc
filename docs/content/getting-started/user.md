# Create an user account

This tutorial assumes that you just deployed a HedgeDoc instance with [this guide][setup].
We'll assume the domain you use for the instance is <https://hedgedoc.localhost>, so please
substitute it with your actual domain anywhere you encounter <https://hedgedoc.localhost> if
that differs.

1. Go to <https://hedgedoc.localhost>. You will be greeted by the login page.

   ![HedgeDoc login page][login-page]{ width="700" }

2. Click on the "Register" button in "Sign in via Username" section.

3. Choose your preferred username, display name and password.

   You are able to change any of these values except the username, so choose a username
   you want to keep. The username needs to be lowercase and may only contain the letters a-z,
   the numbers 0-9, and the underscore (_), dot (.) and hyphen (-).
   ![Register form][register-form]{ width="400" }

4. Click on the "Register" button.

If everything worked, you'll now get redirected to the "explore page", which is the start
page for accessing your notes. A notification in the top right confirms your account creation.

![Notification confirming the successful account creation][success-notification]{ width="400" }

HedgeDoc stores your login for 14 days in your browser per default. You can configure this
session duration via the config options. Of course, you can always log out of your account
to clear the session.

The next time you need to log in, just use your chosen username and password.

## Further reading

- [Creating your first note][getting-started/first-note]
- [Learn about the explore page][getting-started/explore]
- [Creating your first presentation][getting-started/first-presentation]
- [Advanced configuration options][config]

[setup]: ./setup.md

[login-page]: ../images/tutorial/user/login-page.png
[register-form]: ../images/tutorial/user/register-form.png
[success-notification]: ../images/tutorial/user/notification-success.png

[getting-started/first-note]: first-note.md
[getting-started/first-presentation]: first-presentation.md
[getting-started/explore]: explore.md
[config]: ../config/index.md
