package com.example.essayscoring.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.AppealInfo;
import com.example.essayscoring.dto.ResolveAppealRequest;
import com.example.essayscoring.entity.AppealStatus;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.AppealService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/appeals")
public class AdminAppealController {

    private final AppealService appealService;
    private final UserRepository users;

    public AdminAppealController(AppealService appealService, UserRepository users) {
        this.appealService = appealService;
        this.users = users;
    }

    private User current(Authentication auth) {
        return users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    /** GET /api/admin/appeals?status=PENDING (status không bắt buộc). */
    @GetMapping
    public List<AppealInfo> list(@RequestParam(required = false) AppealStatus status) {
        return appealService.list(status);
    }

    @PutMapping("/{id}/resolve")
    public AppealInfo resolve(@PathVariable Long id, @Valid @RequestBody ResolveAppealRequest req,
                              Authentication auth) {
        return appealService.resolve(id, req, current(auth));
    }
}