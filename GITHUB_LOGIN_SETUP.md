# GitHub Login & Sync Setup Guide

## What Was Fixed

### 1. Session Cookie Configuration
- **File**: `backend/src/utils/session.ts`
- **Change**: Added `sameSite: 'lax'` to ensure cookies survive OAuth redirects
- **Why**: Default browser behavior can block cookies on cross-site redirects; `lax` allows them on top-level navigations

### 2. Session Persistence During OAuth Flow
- **File**: `backend/src/api/private/auth/oidc/oidc.controller.ts`
- **Changes**:
  - Force `session.save()` before redirecting to GitHub (login start)
  - Force `session.save()` after setting userId (callback)
  - Added debug logging throughout the flow
- **Why**: Express-session doesn't auto-save when using `@Redirect()` decorators; without explicit saves, session data was lost between redirects

### 3. Environment Variable Alignment
- **File**: `.env` and `backend/src/config/auth.config.ts`
- **Change**: Fixed `HD_AUTH_OIDC_GITHUB_USER_NAME_FIELD` → `HD_AUTH_OIDC_GITHUB_USERNAME_FIELD`
- **Why**: Typo in env var name caused username field to not be read correctly

### 4. Logout Idempotency
- **File**: `backend/src/api/private/auth/auth.controller.ts`
- **Change**: Removed `SessionGuard` from logout endpoint; made it never throw
- **Why**: Expired/missing sessions should still allow logout to succeed

## Current Configuration

Your `.env` file now has:

```env
HD_BASE_URL=http://localhost:8080
HD_AUTH_OIDC_SERVERS=github
HD_AUTH_OIDC_GITHUB_PROVIDER_NAME=GitHub
HD_AUTH_OIDC_GITHUB_ISSUER=https://github.com
HD_AUTH_OIDC_GITHUB_CLIENT_ID=Ov23li7n17RDtkHWY8CQ
HD_AUTH_OIDC_GITHUB_CLIENT_SECRET=d4be9d1db4732ddcb4416ac7abe6249a69303983
HD_AUTH_OIDC_GITHUB_AUTHORIZE_URL=https://github.com/login/oauth/authorize
HD_AUTH_OIDC_GITHUB_TOKEN_URL=https://github.com/login/oauth/access_token
HD_AUTH_OIDC_GITHUB_USERINFO_URL=https://api.github.com/user
HD_AUTH_OIDC_GITHUB_SCOPE=read:user user:email repo
HD_AUTH_OIDC_GITHUB_USERNAME_FIELD=login
```

**Key Points**:
- `HD_BASE_URL` matches your browser URL (`http://localhost:8080`)
- `scope` includes `repo` for GitHub sync functionality
- All field mappings align with GitHub's API response format

## How to Test

### 1. Verify Services Are Running

```bash
# Check backend (should show port 3000)
ps aux | grep "nest start"

# Check frontend (should show port 3001)
ps aux | grep "next dev"

# Check dev proxy (should show port 8080)
ps aux | grep caddy
```

### 2. Test GitHub Login Flow

1. **Open browser** to `http://localhost:8080`
2. **Create a note** as anonymous user (to test guest access)
3. **Click the login button** (top-right dropdown)
4. **Select "GitHub"** from the login options
5. **Authorize on GitHub** (you'll be redirected)
6. **Verify redirect back** to `http://localhost:8080/` with your GitHub user logged in

### 3. Check Backend Logs

Watch for these log messages in `/tmp/hedgedoc-backend.log`:

```
[OidcController] Session saved for OIDC login
[OidcController] OIDC callback received for github
[OidcController] Session data present: true
[OidcController] OIDC user identifier: <your-github-id>
[OidcController] Found existing user: <user-id>
[OidcController] Session saved successfully after login
```

### 4. Test Edit Page Access

1. After logging in, **create a new note** or **open an existing one**
2. **Verify you can edit** and see your username/avatar
3. **Check WebSocket connection** (you should see realtime updates)
4. Backend logs should show:
   ```
   [WebsocketGateway] New realtime connection to note '<id>' by user '<your-id>' from ::ffff:127.0.0.1
   [HedgeDoc.RealtimeNote <id>()] User '<your-github-username>' connected
   ```

### 5. Test Logout

1. **Click your avatar** (top-right)
2. **Select "Sign Out"**
3. **Verify** you're redirected to home and no error toast appears

## Troubleshooting

### Still seeing "The user has no session"?

**Check in browser DevTools (Network tab) during callback**:
- Request to `/api/private/auth/oidc/github/callback`
- Look at **Request Headers**
- Confirm `Cookie: hedgedoc-session=...` is present

**If cookie is missing**:
- Ensure you're browsing to `http://localhost:8080` (not `3001` or `3000`)
- Check GitHub OAuth app callback URL is exactly: `http://localhost:8080/api/private/auth/oidc/github/callback`
- Restart all three services (backend, frontend, proxy)

### Login succeeds but can't access edit page?

**Check SessionGuard logs**:
```bash
grep "SessionGuard" /tmp/hedgedoc-backend.log
```

If you see "The user has no session" after successful callback:
- Session may not be persisting to store
- Check that `HD_SESSION_SECRET` is set (currently is)
- Verify no conflicting cookies with same name from other ports

### GitHub Sync not working?

**Verify scope**:
- `.env` has `HD_AUTH_OIDC_GITHUB_SCOPE=read:user user:email repo`
- On GitHub, go to Settings → Applications → Authorized OAuth Apps → HedgeDoc
- Verify "Repository access" shows the `repo` scope

**Check access token storage**:
In the callback logs, you should see:
```
[OidcService] Stored GitHub access token in session for sync functionality
```

## Next Steps

Once login works:
1. Test creating and editing notes as a logged-in GitHub user
2. Try using GitHub sync features (if implemented in frontend)
3. Test logout and re-login
4. Verify session persists across browser refreshes

## Support

If issues persist, share:
- Full backend logs from login attempt
- Browser DevTools Network tab screenshot of the callback request
- Your current browser URL during the flow
