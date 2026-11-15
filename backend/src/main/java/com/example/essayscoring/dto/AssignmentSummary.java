package com.example.essayscoring.dto;

import java.time.LocalDateTime;

public record AssignmentSummary(
        Long id,
        String title,
        String description,
        String owner,
        LocalDateTime createdAt) {
}