package com.example.vod.config;

import com.example.vod.service.UserTokenVersionCache;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Validates that the JWT's "tv" claim still matches the user's token_version
 * column. On a mismatch (typically caused by change-password), clears the
 * authentication so downstream authorization sees an anonymous request and
 * returns 401.
 *
 * Reads through {@link UserTokenVersionCache} (Caffeine, default 30s TTL) so
 * hot endpoints don't pay a DB round-trip per request. AuthService explicitly
 * invalidates the cache entry on change-password so the changing user sees
 * instant revocation; the staleness window only applies to back-channel
 * mutations (e.g. an operator running SQL directly).
 */
@Component
public class JwtTokenVersionFilter extends OncePerRequestFilter {

    private final UserTokenVersionCache cache;

    public JwtTokenVersionFilter(UserTokenVersionCache cache) {
        this.cache = cache;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        Authentication authn = SecurityContextHolder.getContext().getAuthentication();
        if (authn != null && authn.getPrincipal() instanceof Jwt jwt) {
            String username = jwt.getSubject();
            Long claimTv = jwt.getClaim("tv");
            if (username == null || claimTv == null) {
                SecurityContextHolder.clearContext();
            } else {
                cache.get(username).ifPresentOrElse(currentTv -> {
                    if (currentTv != claimTv.longValue()) {
                        SecurityContextHolder.clearContext();
                    }
                }, SecurityContextHolder::clearContext);
            }
        }
        chain.doFilter(req, res);
    }
}
