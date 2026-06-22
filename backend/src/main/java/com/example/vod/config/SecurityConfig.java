package com.example.vod.config;

import com.nimbusds.jose.JWSAlgorithm;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtProperties jwtProperties;
    private final JwtTokenVersionFilter tokenVersionFilter;

    public SecurityConfig(JwtProperties jwtProperties, JwtTokenVersionFilter tokenVersionFilter) {
        this.jwtProperties = jwtProperties;
        this.tokenVersionFilter = tokenVersionFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Cost 10 matches the gen_salt('bf', 10) used in V2__auth.sql.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://127.0.0.1:5173", "http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        // Translate the "role" claim ("ADMIN" | "VIEWER") into the
        // ROLE_ADMIN / ROLE_VIEWER authorities @PreAuthorize("hasRole(...)")
        // expects. Reject access tokens whose typ != "access" so a refresh
        // token can never be used to call /api.
        JwtAuthenticationConverter c = new JwtAuthenticationConverter();
        c.setJwtGrantedAuthoritiesConverter(jwt -> {
            String typ = jwt.getClaimAsString("typ");
            if (typ != null && !"access".equals(typ)) {
                return List.of();
            }
            String role = jwt.getClaimAsString("role");
            return role == null
                ? List.of()
                : List.of(new SimpleGrantedAuthority("ROLE_" + role));
        });
        return c;
    }

    // @Primary so Spring Security 7's oauth2ResourceServer.jwt() autowire
    // picks the access decoder when two JwtDecoder beans coexist. SS6 used
    // to fall back to the well-known bean name "jwtDecoder"; SS7 errors
    // with "expected single matching bean but found 2".
    @Primary
    @Bean
    public JwtDecoder jwtDecoder() {
        // Primary decoder used by oauth2ResourceServer for every Authorization:
        // Bearer call. Accepts only access tokens; refresh tokens fail at the
        // validation step and surface as 401 (not 200-with-empty-authorities).
        NimbusJwtDecoder decoder = buildDecoder();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefault(),
            requireTyp("access")));
        return decoder;
    }

    @Bean(name = "refreshJwtDecoder")
    public JwtDecoder refreshJwtDecoder() {
        // Used only by AuthController.refresh to verify the refresh token in
        // the request body. Symmetric algorithm + same secret as the primary
        // decoder, but enforces typ=refresh so an access token can never be
        // swapped for new tokens.
        NimbusJwtDecoder decoder = buildDecoder();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefault(),
            requireTyp("refresh")));
        return decoder;
    }

    private NimbusJwtDecoder buildDecoder() {
        byte[] secret = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        SecretKey key = new SecretKeySpec(secret, JWSAlgorithm.HS256.getName());
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }

    private static OAuth2TokenValidator<Jwt> requireTyp(String expected) {
        return jwt -> {
            String typ = jwt.getClaimAsString("typ");
            return expected.equals(typ)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error(
                    "invalid_token",
                    "Expected typ=" + expected + ", got typ=" + typ,
                    null));
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/auth/login", "/auth/register", "/auth/refresh").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                // Demo-DRM: the master manifest is authenticated so we know
                // the viewer's identity, and we embed a viewer- and time-
                // bound signed URL in the manifest's #EXT-X-KEY line. The
                // license.key endpoint then validates that signed URL on
                // its own — no Bearer required. ts segments stay open.
                .requestMatchers("/playback/*/master.m3u8").authenticated()
                // program.m3u8 carries the per-viewer signed license URL
                // rewritten at request time, so it must be authenticated too.
                .requestMatchers("/playback/*/program.m3u8").authenticated()
                .requestMatchers("/playback/*/license.key").permitAll()
                .requestMatchers("/playback/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(rs -> rs.jwt(j -> j.jwtAuthenticationConverter(jwtAuthenticationConverter())))
            // Compare JWT "tv" claim against users.token_version on every
            // authenticated request, after the BearerTokenAuthenticationFilter
            // has set the principal.
            .addFilterAfter(tokenVersionFilter, BearerTokenAuthenticationFilter.class);
        return http.build();
    }
}
