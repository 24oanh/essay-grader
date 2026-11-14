package com.example.essayscoring.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record HistoryDetail(
        Long id, LocalDateTime createdAt, String text, ScoreResponse result,
        double score, boolean humanReviewed,
        Map<String, Double> teacherCriteria, 
        String teacherNote,
        String reviewer,
        LocalDateTime reviewedAt) {}