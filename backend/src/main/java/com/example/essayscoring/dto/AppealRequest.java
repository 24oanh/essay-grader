package com.example.essayscoring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AppealRequest(
        @NotBlank(message = "Vui lòng nêu lý do khiếu nại")
        @Size(max = 2000, message = "Lý do tối đa 2000 ký tự") String reason) {}