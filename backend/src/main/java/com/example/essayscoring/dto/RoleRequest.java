package com.example.essayscoring.dto;

import com.example.essayscoring.entity.Role;
import jakarta.validation.constraints.NotNull;

public record RoleRequest(@NotNull Role role) {}