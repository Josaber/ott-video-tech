package com.example.vod.config;

import com.example.vod.repository.UserRepository;
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
 * returns 401. One DB hit per authenticated request — acceptable for a
 * demo, would warrant a short-lived cache in production.
 */
@Component
public class JwtTokenVersionFilter extends OncePerRequestFilter {

    private final UserRepository users;

    public JwtTokenVersionFilter(UserRepository users) {
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        Authentication authn = SecurityContextHolder.getContext().getAuthentication();
        if (authn != null && authn.getPrincipal() instanceof Jwt jwt) {
            String username = jwt.getSubject();
            Long claimTv = jwt.getClaim("tv");
            if (username != null && claimTv != null) {
                users.findByUsername(username).ifPresentOrElse(user -> {
                    if (user.getTokenVersion() != claimTv) {
                        SecurityContextHolder.clearContext();
                    }
                }, SecurityContextHolder::clearContext);
            } else {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(req, res);
    }
}
