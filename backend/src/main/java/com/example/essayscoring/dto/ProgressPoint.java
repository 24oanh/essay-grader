package com.example.essayscoring.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ProgressPoint(Long id, int attemptNo, LocalDateTime createdAt,
                            double score, Map<String, Double> criteria) {}