package com.example.essayscoring.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.AssignmentRequest;
import com.example.essayscoring.dto.AssignmentResponse;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.AssignmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/teacher/assignments")
public class TeacherAssignmentController {

    private final AssignmentService service;
    private final UserRepository users;

    public TeacherAssignmentController(AssignmentService service, UserRepository users) {
        this.service = service;
        this.users = users;
    }

    private User current(Authentication auth) {
        return users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @GetMapping
    public List<AssignmentResponse> mine(Authentication auth) {
        return service.listMine(current(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssignmentResponse create(@Valid @RequestBody AssignmentRequest req, Authentication auth) {
        return service.create(req, current(auth));
    }

    @PutMapping("/{id}")
    public AssignmentResponse update(@PathVariable Long id, @Valid @RequestBody AssignmentRequest req,
            Authentication auth) {
        return service.update(id, req, current(auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        service.delete(id, current(auth));
        return ResponseEntity.noContent().build();
    }
}