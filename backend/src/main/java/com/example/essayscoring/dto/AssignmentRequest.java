package com.example.essayscoring.dto;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AssignmentRequest(
        @NotBlank(message = "Tiêu đề không được để trống") @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @NotNull Map<String, RubricItem> rubric) {
}