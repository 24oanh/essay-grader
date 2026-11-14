package com.example.essayscoring.controller;

import com.example.essayscoring.dto.RoleRequest;
import com.example.essayscoring.dto.UserInfo;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository users;

    public AdminController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/users")
    public List<UserInfo> list() {
        return users.findAll().stream()
                .map(u -> new UserInfo(u.getId(), u.getUsername(), u.getRole().name(), u.getCreatedAt()))
                .toList();
    }

    @PutMapping("/users/{id}/role")
    public UserInfo changeRole(@PathVariable Long id, @Valid @RequestBody RoleRequest req,
                               Authentication auth) {
        User user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        if (user.getUsername().equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể đổi vai trò của chính mình");
        }
        user.setRole(req.role());
        users.save(user);
        return new UserInfo(user.getId(), user.getUsername(), user.getRole().name(), user.getCreatedAt());
    }
}