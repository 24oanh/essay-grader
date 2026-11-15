package com.example.essayscoring.controller;

import com.example.essayscoring.dto.TeacherEssayItem;
import com.example.essayscoring.dto.TeacherReviewRequest;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.TeacherService;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.example.essayscoring.dto.BatchScoreResult;
import com.example.essayscoring.service.EssayService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    private final TeacherService teacherService;
    private final EssayService essayService;
    private final UserRepository users;

    public TeacherController(TeacherService teacherService, EssayService essayService, UserRepository users) {
        this.teacherService = teacherService;
        this.essayService = essayService;
        this.users = users;
    }

    private User current(Authentication auth) {
        return users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    /** GET /api/teacher/essays?reviewed=false (reviewed không bắt buộc). */
    @GetMapping("/essays")
    public List<TeacherEssayItem> list(@RequestParam(required = false) Boolean reviewed) {
        return teacherService.list(reviewed);
    }

    @PutMapping("/essays/{id}/review")
    public TeacherEssayItem review(@PathVariable Long id, @Valid @RequestBody TeacherReviewRequest req,
            Authentication auth) {
        return teacherService.review(id, req, current(auth));
    }

    @PostMapping(value = "/essays/batch-score", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<BatchScoreResult> batchScore(@RequestParam("files") List<MultipartFile> files, Authentication auth) {
        if (files.isEmpty() || files.size() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần từ 1 đến 50 file mỗi lần");
        }
        return essayService.scoreBatch(files, current(auth));
    }
}