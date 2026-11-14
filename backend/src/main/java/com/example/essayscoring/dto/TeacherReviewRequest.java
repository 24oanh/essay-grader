package com.example.essayscoring.dto;

import java.util.Map;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TeacherReviewRequest(
        @NotNull(message = "Thiếu điểm tổng")
        @DecimalMin(value = "0.0", message = "Điểm tối thiểu là 0")
        @DecimalMax(value = "10.0", message = "Điểm tối đa là 10") Double score,
        Map<String, Double> criteria, // tùy chọn
        @NotBlank(message = "Vui lòng ghi nhận xét")
        @Size(max = 2000, message = "Nhận xét tối đa 2000 ký tự") String note) {}