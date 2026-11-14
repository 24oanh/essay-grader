package com.example.essayscoring.controller;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.AuthResponse;
import com.example.essayscoring.dto.GoogleLoginRequest;
import com.example.essayscoring.dto.LoginRequest;
import com.example.essayscoring.dto.RegisterRequest;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.security.GoogleTokenVerifier;
import com.example.essayscoring.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final GoogleTokenVerifier googleVerifier;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt,
                          GoogleTokenVerifier googleVerifier) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.googleVerifier = googleVerifier;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        if (users.existsByUsername(req.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại");
        }
        User user = new User();
        user.setUsername(req.username());
        user.setPasswordHash(encoder.encode(req.password()));
        users.save(user);
        return toResponse(user);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User user = users.findByUsername(req.username())
                .filter(u -> encoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Sai tên đăng nhập hoặc mật khẩu"));
        return toResponse(user);
    }

    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleLoginRequest req) {
        GoogleIdToken.Payload payload = googleVerifier.verify(req.credential());
        if (payload == null || !Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Đăng nhập Google không hợp lệ");
        }
        String sub = payload.getSubject();
        String email = payload.getEmail();

        User user = users.findByGoogleId(sub).orElseGet(() -> createGoogleUser(sub, email));
        return toResponse(user);
    }

    private User createGoogleUser(String sub, String email) {
        String username = email;
        // Tránh trùng với tên đăng nhập do người khác đã đăng ký thủ công
        while (users.existsByUsername(username)) {
            username = email + "#" + ThreadLocalRandom.current().nextInt(1000, 10000);
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setGoogleId(sub);
        // Mật khẩu ngẫu nhiên không ai biết: tài khoản Google chỉ đăng nhập bằng Google
        user.setPasswordHash(encoder.encode(UUID.randomUUID().toString()));
        return users.save(user);
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwt.generate(user), user.getUsername(), user.getRole().name());
    }
}