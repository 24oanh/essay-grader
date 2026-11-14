package com.example.essayscoring.dto;

import com.example.essayscoring.entity.TeacherRequestStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** status: APPROVED hoặc REJECTED. note bắt buộc khi từ chối. */
public record TeacherRequestDecision(
        @NotNull(message = "Thiếu quyết định") TeacherRequestStatus status,
        @Size(max = 2000, message = "Ghi chú tối đa 2000 ký tự") String note) {}