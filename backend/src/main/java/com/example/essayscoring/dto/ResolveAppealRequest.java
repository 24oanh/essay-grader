package com.example.essayscoring.dto;

import com.example.essayscoring.entity.AppealStatus;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * status: APPROVED (chấm lại, bắt buộc có newScore) hoặc REJECTED (giữ điểm cũ).
 * note: bắt buộc cho cả hai trường hợp để học sinh biết lý do.
 */
public record ResolveAppealRequest(
        @NotNull(message = "Thiếu quyết định") AppealStatus status,
        @DecimalMin(value = "0.0", message = "Điểm tối thiểu là 0")
        @DecimalMax(value = "10.0", message = "Điểm tối đa là 10") Double newScore,
        @NotBlank(message = "Vui lòng ghi chú lý do quyết định")
        @Size(max = 2000, message = "Ghi chú tối đa 2000 ký tự") String note) {}