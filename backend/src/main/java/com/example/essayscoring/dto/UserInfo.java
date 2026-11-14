package com.example.essayscoring.dto;

import java.time.LocalDateTime;

public record UserInfo(Long id, String username, String role, LocalDateTime createdAt) {}