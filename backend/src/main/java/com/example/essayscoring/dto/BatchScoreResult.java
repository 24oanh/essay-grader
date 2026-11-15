package com.example.essayscoring.dto;

public record BatchScoreResult(
        String name,
        boolean success,
        ScoreResponse result,
        String error) {}