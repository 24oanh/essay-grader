package com.example.essayscoring.dto;

import jakarta.validation.constraints.NotBlank;

public record ScoreRequest(
        @NotBlank(message = "Bài luận không được để trống") String text,
        Long assignmentId) {
}