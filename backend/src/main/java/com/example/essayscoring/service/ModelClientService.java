package com.example.essayscoring.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.example.essayscoring.dto.ScoreResponse;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Service
public class ModelClientService {

    /** Thang điểm của hệ thống (0-10). Model trả điểm tổng thang 0-100 nên chia 10. */
    private static final double HOLISTIC_MAX = 100.0;
    private static final double APP_MAX = 10.0;

    // Body gửi sang model service (FastAPI) dùng trường "essay"
    private record ModelRequest(String essay) {}

    // Đúng format /predict của model-service: score (0-100), criteria (tên đầy đủ -> 0-10)
    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ModelResponse(double score, Map<String, Double> criteria) {}

    private final RestClient restClient;

    public ModelClientService(@Value("${model.service.url}") String baseUrl) {
        // Model chạy bằng CPU nên mỗi lần chấm mất vài giây, đặt timeout rộng
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);   // 10 giây
        factory.setReadTimeout(120_000);     // 120 giây

        this.restClient = RestClient.builder()
                .requestFactory(factory)
                .baseUrl(baseUrl)
                .build();
    }

    public ScoreResponse score(String text) {
        ModelResponse res;
        try {
            res = restClient.post()
                    .uri("/predict")
                    .body(new ModelRequest(text))
                    .retrieve()
                    .body(ModelResponse.class);
        } catch (RestClientException e) {
            throw new IllegalStateException(
                    "Không gọi được model service. Kiểm tra uvicorn đã chạy ở cổng 8000 chưa. Chi tiết: "
                            + e.getMessage(), e);
        }

        if (res == null || res.criteria() == null) {
            throw new IllegalStateException("Model service trả về rỗng");
        }

        Map<String, Double> criteria = new LinkedHashMap<>();
        for (Map.Entry<String, Double> e : res.criteria().entrySet()) {
            criteria.put(CriteriaKeys.fromModelName(e.getKey()), round1(e.getValue()));
        }
        if (!criteria.keySet().containsAll(CriteriaKeys.ALL)) {
            throw new IllegalStateException("Model trả thiếu tiêu chí. Nhận được: " + criteria.keySet());
        }

        double score = round1(res.score() / HOLISTIC_MAX * APP_MAX);
        // Model không có giải thích theo từ -> để rỗng (không bịa số liệu)
        return new ScoreResponse(score, criteria, List.of());
    }

    private static double round1(double v) {
        return Math.round(v * 10) / 10.0;
    }
}
