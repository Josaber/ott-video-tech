package com.example.vod.config;

import com.nimbusds.jose.JWSAlgorithm;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
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

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] secret = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        SecretKey key = new SecretKeySpec(secret, JWSAlgorithm.HS256.getName());
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
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
                // license.key is the meaningful secret — token required.
                .requestMatchers("/playback/*/license.key").authenticated()
                // master.m3u8 and ts segments stay open: the player can fetch
                // them without auth so HLS playback works without sessionizing.
                // Real protection here needs sessionized manifests, which is
                // out of scope for this demo.
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
