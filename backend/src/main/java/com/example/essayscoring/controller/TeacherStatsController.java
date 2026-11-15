package com.example.essayscoring.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.ClassStats;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.StatsService;

@RestController
public class TeacherStatsController {

    private final StatsService stats;
    private final UserRepository users;

    public TeacherStatsController(StatsService stats, UserRepository users) {
        this.stats = stats;
        this.users = users;
    }

    @GetMapping("/api/teacher/assignments/{id}/stats")
    public ClassStats classStats(@PathVariable Long id, Authentication auth) {
        User teacher = users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return stats.classStats(id, teacher);
    }
}