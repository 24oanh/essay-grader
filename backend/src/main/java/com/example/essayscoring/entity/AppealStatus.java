package com.example.essayscoring.entity;

public enum AppealStatus {
    PENDING,   // đang chờ người chấm xử lý
    APPROVED,  // chấp nhận: điểm đã được chấm lại bởi con người
    REJECTED   // từ chối: giữ nguyên điểm cũ, có ghi chú lý do
}