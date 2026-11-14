package com.example.essayscoring.dto;

import java.util.List;
import java.util.Map;

public record ScoreResponse(
        double score,
        Map<String, Double> criteria,
        List<WordWeight> explanation) {

    public record WordWeight(String word, double weight) {}
}