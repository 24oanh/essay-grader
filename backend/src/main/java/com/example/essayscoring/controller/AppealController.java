package com.example.essayscoring.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.AppealInfo;
import com.example.essayscoring.dto.AppealRequest;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.AppealService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AppealController {

    private final AppealService appealService;
    private final UserRepository users;

    public AppealController(AppealService appealService, UserRepository users) {
        this.appealService = appealService;
        this.users = users;
    }

    private User current(Authentication auth) {
        return users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    /** Gửi khiếu nại + yêu cầu chấm lại cho một bài luận. */
    @PostMapping("/essays/{essayId}/appeals")
    @ResponseStatus(HttpStatus.CREATED)
    public AppealInfo create(@PathVariable Long essayId, @Valid @RequestBody AppealRequest req,
                             Authentication auth) {
        return appealService.create(essayId, req.reason(), current(auth));
    }

    /** Danh sách khiếu nại của tôi và trạng thái xử lý. */
    @GetMapping("/appeals/mine")
    public List<AppealInfo> mine(Authentication auth) {
        return appealService.mine(current(auth));
    }
}