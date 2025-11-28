import 'express-session';

declare module 'express-session' {
  interface Session {
    oidcIdToken?: string;
    githubAccessToken?: string;
  }
}