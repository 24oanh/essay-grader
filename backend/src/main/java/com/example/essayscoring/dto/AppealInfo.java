package com.example.essayscoring.dto;

import java.time.LocalDateTime;

public record AppealInfo(
        Long id,
        Long essayId,
        String student,
        String reason,
        String status,
        double originalScore,
        Double newScore,
        String reviewerNote,
        String reviewer,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt) {}