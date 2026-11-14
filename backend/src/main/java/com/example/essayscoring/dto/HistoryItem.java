package com.example.essayscoring.dto;

import java.time.LocalDateTime;

public record HistoryItem(Long id, LocalDateTime createdAt, String text, double score,
                          String owner, boolean humanReviewed, Long rootId) {}