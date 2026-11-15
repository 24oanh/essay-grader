package com.example.essayscoring.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record AssignmentResponse(
        Long id,
        String title,
        String description,
        Map<String, RubricItem> rubric,
        String owner,
        LocalDateTime createdAt) {
}