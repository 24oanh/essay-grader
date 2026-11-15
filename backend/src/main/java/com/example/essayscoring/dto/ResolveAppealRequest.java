package com.example.essayscoring.dto;

import java.util.Map;

import com.example.essayscoring.entity.AppealStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * status: APPROVED (chấm lại, bắt buộc đủ 3 tiêu chí, điểm tổng tự tính) hoặc
 * REJECTED (giữ điểm cũ).
 * note: bắt buộc cho cả hai trường hợp để học sinh biết lý do.
 */
public record ResolveAppealRequest(
                @NotNull(message = "Thiếu quyết định") AppealStatus status,
                Map<String, Double> criteria,
                @NotBlank(message = "Vui lòng ghi chú lý do quyết định") @Size(max = 2000, message = "Ghi chú tối đa 2000 ký tự") String note) {
}