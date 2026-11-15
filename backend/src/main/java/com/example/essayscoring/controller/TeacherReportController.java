package com.example.essayscoring.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.ReportService;

@RestController
public class TeacherReportController {

    private final ReportService reports;
    private final UserRepository users;

    public TeacherReportController(ReportService reports, UserRepository users) {
        this.reports = reports;
        this.users = users;
    }

    @GetMapping("/api/teacher/assignments/{id}/report/excel")
    public ResponseEntity<byte[]> excel(@PathVariable Long id, Authentication auth) {
        User teacher = users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        byte[] data = reports.classReport(id, teacher);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-diem.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}