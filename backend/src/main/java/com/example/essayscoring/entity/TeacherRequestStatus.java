package com.example.essayscoring.entity;

public enum TeacherRequestStatus {
    PENDING,   // chờ quản trị viên duyệt
    APPROVED,  // đã duyệt: tài khoản trở thành TEACHER
    REJECTED   // bị từ chối, có ghi chú lý do
}