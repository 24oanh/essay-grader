package com.example.essayscoring.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// Model service trả thêm trường "calibrated" (và không có "explanation") nên cần bỏ qua trường lạ.
@JsonIgnoreProperties(ignoreUnknown = true)
public record ScoreResponse(
        double score,
        Map<String, Double> criteria,
        List<WordWeight> explanation) {

    public ScoreResponse {
        if (explanation == null) {
            explanation = List.of();
        }
    }

    public record WordWeight(String word, double weight) {}
}
