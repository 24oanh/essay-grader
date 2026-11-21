package com.example.essayscoring.service;

import java.util.List;

/**
 * 10 tiêu chí của model (khớp CRIT trong model-service/main.py), thứ tự cũng giữ nguyên.
 * Model trả tên đầy đủ như "Intelligibility (Language)"; ta lấy phần trước dấu "(" viết thường làm khóa.
 */
public final class CriteriaKeys {

    public static final List<String> ALL = List.of(
            "intelligibility", "complexity", "accuracy", "fluency",
            "comprehensibility", "logicality", "sophistication", "purposefulness",
            "willingness", "involvement");

    private CriteriaKeys() {
    }

    /** "Intelligibility (Language)" -> "intelligibility" */
    public static String fromModelName(String modelName) {
        int i = modelName.indexOf('(');
        String base = i >= 0 ? modelName.substring(0, i) : modelName;
        return base.trim().toLowerCase();
    }
}
