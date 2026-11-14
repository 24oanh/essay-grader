package com.example.essayscoring.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record TeacherEssayItem(
        Long id, LocalDateTime createdAt, String text,
        double score,            // điểm hiện tại (sau khi giáo viên chỉnh, nếu có)
        double aiScore,          // điểm AI gốc
        String owner,
        boolean humanReviewed,
        String teacherNote,
        String reviewer,
        LocalDateTime reviewedAt,
        Map<String, Double> aiCriteria,
        Map<String, Double> criteria) {} // tiêu chí hiện tại