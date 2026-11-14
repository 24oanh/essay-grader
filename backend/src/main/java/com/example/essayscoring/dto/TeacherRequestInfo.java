package com.example.essayscoring.dto;

import java.time.LocalDateTime;

public record TeacherRequestInfo(
        Long id, String username, String fullName, String organization, String reason,
        String status, String adminNote, String reviewer,
        LocalDateTime createdAt, LocalDateTime resolvedAt) {}