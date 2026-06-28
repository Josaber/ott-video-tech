import { Chapter } from '../common'
import {
  AuthRefreshFlowFigure,
} from '../../figures'

export const chapter: Chapter = {
  slug: 'auth',
  title: 'Auth & session',
  blurb: 'JWT, refresh tokens, the typ claim, and how change-password keeps you signed in.',
  render: () => (
    <>
      <p>
        Auth in this demo is self-signed <strong>HS256 JWT</strong>: backend mints an access
        token (15 min) and a refresh token (24 h) on login. Both are HS256-signed with the same
        secret but carry a distinguishing <code>typ</code> claim — <code>access</code> vs
        <code>refresh</code>.
      </p>
      <div className="docs-figure">
        <AuthRefreshFlowFigure />
      </div>
      <h3>Why two decoders</h3>
      <p>
        The backend wires <strong>two</strong> <code>JwtDecoder</code> beans, each with an{' '}
        <code>OAuth2TokenValidator&lt;Jwt&gt;</code> that enforces a specific <code>typ</code>.
        The access decoder is <code>@Primary</code> so <code>oauth2ResourceServer.jwt()</code>
        picks it up; the refresh decoder is qualified explicitly on the
        <code>/auth/refresh</code> handler. This blocks a refresh token from being used as a
        Bearer header on protected APIs — a common bug when the rejection happens at
        authorities-conversion time (returning empty authorities still authenticates the
        request, the <code>@PreAuthorize</code> matcher is what 403s, and a frontend interceptor
        that only redirects on 401 silently sends the user nowhere).
      </p>
      <h3>Revocation: token_version</h3>
      <p>
        Every issued JWT embeds a <code>tv</code> claim equal to the user row's current{' '}
        <code>token_version</code>. <code>JwtTokenVersionFilter</code> looks up the live value
        (Caffeine-cached for 30 s) on every authenticated request; a mismatch clears the security
        context. Bumping the user's <code>token_version</code> invalidates every still-valid
        token issued before the bump.
      </p>
      <h3>Change-password stays signed in</h3>
      <p>
        When the user changes their password, the backend bumps <code>token_version</code> —
        which would 401 the same tab on its next API call. To avoid the bounce-through-login
        experience, <code>/auth/change-password</code> returns a fresh access + refresh pair
        stamped with the new <code>tv</code>; the SPA calls <code>setSession()</code> with it.
      </p>
      <h3>Refresh flow on 401</h3>
      <p>
        The client's <code>authedFetch</code> wrapper catches 401, tries{' '}
        <code>/auth/refresh</code>, installs the new pair, retries the original request.{' '}
        <code>inflightRefresh</code> coalesces concurrent 401s so multiple in-flight requests
        share one refresh.
      </p>
    </>
  ),
}
