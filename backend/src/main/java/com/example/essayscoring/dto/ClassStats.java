package com.example.essayscoring.dto;

import java.util.List;
import java.util.Map;

public record ClassStats(
        Long assignmentId,
        String title,
        int count,
        Double average,
        Double median,
        Double max,
        Double min,
        Double stdDev,
        List<Integer> distribution, // 10 khoảng: 0-1, 1-2, ..., 9-10
        Map<String, Double> criteriaAverage,
        double outlierSd, // ngưỡng bất thường (số độ lệch chuẩn)
        int minForOutliers, // số bài tối thiểu để xét bất thường
        List<Outlier> outliers) {

    public record Outlier(
            Long essayId,
            String student,
            double score,
            double deviation, // (điểm - trung bình) / độ lệch chuẩn, có dấu
            String text,
            boolean humanReviewed) {
    }
}