package com.example.vod.service;

import com.example.vod.domain.UserEntity;
import com.example.vod.dto.LoginRequest;
import com.example.vod.dto.LoginResponse;
import com.example.vod.repository.UserRepository;
import java.util.Optional;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwt) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwt = jwt;
    }

    public LoginResponse login(LoginRequest req) {
        Optional<UserEntity> maybe = users.findByUsername(req.username());
        // Always run matches() so timing of "user found" vs "user missing" stays close.
        String hash = maybe.map(UserEntity::getPasswordHash)
                .orElse("$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi");
        boolean ok = passwordEncoder.matches(req.password(), hash);
        if (!ok || maybe.isEmpty()) {
            throw new BadCredentialsException("invalid credentials");
        }
        UserEntity user = maybe.get();
        String token = jwt.issue(user);
        return new LoginResponse(token, "Bearer", jwt.ttlSeconds(), user.getUsername(), user.getRole().name());
    }
}
