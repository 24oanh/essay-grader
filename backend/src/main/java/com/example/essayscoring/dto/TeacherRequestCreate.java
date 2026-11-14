package com.example.essayscoring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeacherRequestCreate(
        @NotBlank(message = "Vui lòng nhập họ tên") @Size(max = 100) String fullName,
        @NotBlank(message = "Vui lòng nhập đơn vị công tác") @Size(max = 200) String organization,
        @NotBlank(message = "Vui lòng nêu lý do / kinh nghiệm") @Size(max = 2000) String reason) {}