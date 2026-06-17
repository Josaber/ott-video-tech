package com.example.vod.service;

import com.example.vod.domain.UserEntity;
import com.example.vod.domain.UserRole;
import com.example.vod.dto.ChangePasswordRequest;
import com.example.vod.dto.LoginRequest;
import com.example.vod.dto.LoginResponse;
import com.example.vod.dto.RegisterRequest;
import com.example.vod.repository.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    // Used when no user is found, so passwordEncoder.matches still runs and login
    // timing doesn't reveal user existence.
    private static final String DUMMY_HASH =
        "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi";

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
        String hash = maybe.map(UserEntity::getPasswordHash).orElse(DUMMY_HASH);
        boolean ok = passwordEncoder.matches(req.password(), hash);
        if (!ok || maybe.isEmpty()) {
            throw new BadCredentialsException("invalid credentials");
        }
        return toLoginResponse(maybe.get());
    }

    @Transactional
    public LoginResponse register(RegisterRequest req) {
        if (users.findByUsername(req.username()).isPresent()) {
            throw new IllegalStateException("username already taken");
        }
        UserEntity user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setUsername(req.username());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(UserRole.VIEWER);
        users.save(user);
        return toLoginResponse(user);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest req) {
        UserEntity user = users.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("invalid credentials"));
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("current password does not match");
        }
        if (passwordEncoder.matches(req.newPassword(), user.getPasswordHash())) {
            throw new IllegalStateException("new password must differ from current");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        users.save(user);
    }

    private LoginResponse toLoginResponse(UserEntity user) {
        String token = jwt.issue(user);
        return new LoginResponse(token, "Bearer", jwt.ttlSeconds(),
                user.getUsername(), user.getRole().name());
    }
}
