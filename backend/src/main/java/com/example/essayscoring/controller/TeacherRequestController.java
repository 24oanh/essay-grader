package com.example.essayscoring.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.TeacherRequestCreate;
import com.example.essayscoring.dto.TeacherRequestDecision;
import com.example.essayscoring.dto.TeacherRequestInfo;
import com.example.essayscoring.entity.TeacherRequestStatus;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.TeacherRequestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class TeacherRequestController {

    private final TeacherRequestService service;
    private final UserRepository users;

    public TeacherRequestController(TeacherRequestService service, UserRepository users) {
        this.service = service;
        this.users = users;
    }

    private User current(Authentication auth) {
        return users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    // ----- Người dùng -----

    @PostMapping("/teacher-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public TeacherRequestInfo create(@Valid @RequestBody TeacherRequestCreate req, Authentication auth) {
        return service.create(req, current(auth));
    }

    @GetMapping("/teacher-requests/mine")
    public List<TeacherRequestInfo> mine(Authentication auth) {
        return service.mine(current(auth));
    }

    // ----- ADMIN (đường dẫn /api/admin/** đã yêu cầu ROLE_ADMIN trong SecurityConfig) -----

    @GetMapping("/admin/teacher-requests")
    public List<TeacherRequestInfo> list(@RequestParam(required = false) TeacherRequestStatus status) {
        return service.list(status);
    }

    @PutMapping("/admin/teacher-requests/{id}/resolve")
    public TeacherRequestInfo resolve(@PathVariable Long id, @Valid @RequestBody TeacherRequestDecision d,
                                      Authentication auth) {
        return service.resolve(id, d, current(auth));
    }
}