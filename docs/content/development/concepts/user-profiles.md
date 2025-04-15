# User Profiles and Authentication

!!! info "Design Document"
    This is a design document, explaining the design and vision for a HedgeDoc 2
    feature. It is not a user guide and may or may not be fully implemented.

Each user in HedgeDoc 2 has a profile
which contains the following information:

- username (`janedoe`)
- display name (`Jane Doe`)
- email address, optional (`janedoe@example.com`)
- profile picture, optional
- the date the user was created
- the date the profile was last updated

HedgeDoc 2 supports multiple authentication methods per user.  
These are called *identities* and each identity is backed by an
auth provider (like OIDC, LDAP or internal auth).

One of a users identities may be marked as *sync source*.  
This identity is used to automatically update profile attributes like the
display name or profile picture on every login. If a sync source exists, the
user can not manually edit their profile information.
If an external provider was used to create the account,
it is automatically used as sync source.

The administrator may globally set one or more auth providers as sync source,
e.g. to enforce that all profile information comes from the corporate
LDAP and is the same across multiple applications.  
If global sync sources exist, new accounts can only be created using
these auth providers. The auth provider that was used to create the account
is automatically set as sync source and cannot be changed by the user.
This effectively pins the account to this provider.

## Example: Corporate LDAP

The administrator wants to allow users to log in via the corporate LDAP
and Google. Login must only be possible for users present in LDAP and
all users must be displayed as they are in the LDAP.

The admin therefore sets up two login providers:

- corporate LDAP, marked as global sync source
- Google OAuth login

If a new user tries to log in via Google, they will not be found in the
database. The frontend detects that a global sync source exists and
suggests logging in via LDAP first.

After a new user created their account by logging in via LDAP, they can use
the 'add a new login method' feature in their profile page to link their
Google account and use it to login afterwards.

## Example: Username Conflict

HedgeDoc is configured with two auth providers.

- A user logs in using auth provider A.
- The backend receives the profile information from provider A and notices that the username
  in the profile already exists in the database, but no identity for this provider-username
  combination exists.
- The backend creates a new user with another username to solve the username conflict.
- The frontend warns the user that the username provided by the auth provider is already taken
  and that another username has been generated. It also offers to instead link the new auth provider
  (in this case A) with the existing auth provider (in this case B).
- If the user chooses the latter option, the frontend sends a request to delete the newly created
  user to the backend.
- The user can then log in with auth provider B and link provider A using the "link auth provider"
  feature in the profile page.

### Handling of sync sources and username conflicts

#### Global sync sources

If at the time of logging in with auth provider A, *only* A is configured as a *global* sync source,
the backend cannot automatically create a user with another username.

This is because:

- Creating new accounts is only possible with a sync source auth provider.
- Setting an auth provider as sync-source entails that profile information the auth provider
  provides must be saved into the local HedgeDoc database.
- As the username the auth provider provides already exists in the database, a new user cannot
  be created with that username.

In this case, the frontend should show the use a notice that they should contact an admin
to resolve the issue.

!!! warning
    Admins must ensure that usernames are unique across all auth providers set as a global sync
    source. Otherwise, if e.g. in both LDAPs configured as sync source a user `johndoe` exists,
    only the first that logs in can use HedgeDoc.

#### Local sync sources

If auth provider A is configured as a sync source by the user, syncing is automatically disabled,
and a notice is shown. Re-enabling the sync source is not possible until the username conflict is
resolved, e.g. by changing the username in the auth provider.
