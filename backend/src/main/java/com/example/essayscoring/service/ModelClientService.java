package com.example.essayscoring.service;

import com.example.essayscoring.dto.EssayRequest;
import com.example.essayscoring.dto.ScoreResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class ModelClientService {

    private final RestClient restClient;

    public ModelClientService(@Value("${model.service.url}") String baseUrl) {
        this.restClient = RestClient.builder()
                .requestFactory(new SimpleClientHttpRequestFactory())
                .baseUrl(baseUrl)
                .build();
    }

    public ScoreResponse score(String text) {
        return restClient.post()
                .uri("/score")
                .body(new EssayRequest(text))
                .retrieve()
                .body(ScoreResponse.class);
    }
}