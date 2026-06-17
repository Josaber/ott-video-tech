package com.example.vod.web;

import com.example.vod.domain.UserEntity;
import com.example.vod.dto.ChangePasswordRequest;
import com.example.vod.dto.LoginRequest;
import com.example.vod.dto.LoginResponse;
import com.example.vod.dto.MeResponse;
import com.example.vod.dto.RefreshRequest;
import com.example.vod.dto.RegisterRequest;
import com.example.vod.repository.UserRepository;
import com.example.vod.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService auth;
    private final JwtDecoder jwtDecoder;
    private final UserRepository users;

    public AuthController(AuthService auth, JwtDecoder jwtDecoder, UserRepository users) {
        this.auth = auth;
        this.jwtDecoder = jwtDecoder;
        this.users = users;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest req) {
        LoginResponse body = auth.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@Valid @RequestBody RefreshRequest req) {
        Jwt decoded;
        try {
            decoded = jwtDecoder.decode(req.refreshToken());
        } catch (JwtException e) {
            throw new BadCredentialsException("invalid refresh token");
        }
        if (!"refresh".equals(decoded.getClaimAsString("typ"))) {
            throw new BadCredentialsException("not a refresh token");
        }
        UserEntity user = users.findByUsername(decoded.getSubject())
                .orElseThrow(() -> new BadCredentialsException("user not found"));
        Long claimTv = decoded.getClaim("tv");
        if (claimTv == null || user.getTokenVersion() != claimTv) {
            throw new BadCredentialsException("refresh token revoked");
        }
        return auth.refresh(user);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal Jwt jwt,
                                               @Valid @RequestBody ChangePasswordRequest req) {
        auth.changePassword(jwt.getSubject(), req);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        String role = jwt.getClaimAsString("role");
        return new MeResponse(jwt.getSubject(), role);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> badCreds(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "invalid_credentials"));
    }
}
