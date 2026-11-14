package com.example.essayscoring.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.ScoreResponse;
import com.example.essayscoring.dto.TeacherEssayItem;
import com.example.essayscoring.dto.TeacherReviewRequest;
import com.example.essayscoring.entity.EssayResult;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.EssayResultRepository;

@Service
public class TeacherService {

    private static final double MAX_SCORE = 10.0;

    private final EssayResultRepository essays;
    private final EssayService essayService;

    public TeacherService(EssayResultRepository essays, EssayService essayService) {
        this.essays = essays;
        this.essayService = essayService;
    }

    /** reviewed = null: tất cả; true: đã xem lại; false: chưa xem lại. */
    @Transactional(readOnly = true)
    public List<TeacherEssayItem> list(Boolean reviewed) {
        return essays.findAllByOrderByCreatedAtDesc().stream()
                .filter(e -> reviewed == null || e.isHumanReviewed() == reviewed)
                .map(this::toItem)
                .toList();
    }

    /** Giáo viên đặt điểm cuối cùng (có thể chỉnh cả điểm từng tiêu chí) kèm nhận xét. */
    @Transactional
    public TeacherEssayItem review(Long id, TeacherReviewRequest req, User teacher) {
        EssayResult e = essays.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài"));

        if (e.getOwner() != null && e.getOwner().getId().equals(teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự chấm lại bài của chính mình");
        }

        ScoreResponse ai = essayService.fromJson(e.getDetailJson());

        Map<String, Double> criteria = null;
        if (req.criteria() != null && !req.criteria().isEmpty()) {
            for (Map.Entry<String, Double> c : req.criteria().entrySet()) {
                if (!ai.criteria().containsKey(c.getKey())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu chí không hợp lệ: " + c.getKey());
                }
                Double v = c.getValue();
                if (v == null || v < 0 || v > MAX_SCORE) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Điểm tiêu chí phải từ 0 đến " + (int) MAX_SCORE);
                }
            }
            criteria = new LinkedHashMap<>(req.criteria());
        }

        e.setScore(req.score());
        e.setHumanReviewed(true);
        e.setCriteriaOverrideJson(criteria == null ? null : essayService.writeCriteria(criteria));
        e.setTeacherNote(req.note().trim());
        e.setReviewer(teacher);
        e.setReviewedAt(LocalDateTime.now());
        essays.save(e);

        return toItem(e);
    }

    private TeacherEssayItem toItem(EssayResult e) {
        ScoreResponse ai = essayService.fromJson(e.getDetailJson());
        Map<String, Double> override = essayService.readCriteria(e.getCriteriaOverrideJson());
        return new TeacherEssayItem(
                e.getId(), e.getCreatedAt(), e.getText(),
                e.getScore(), ai.score(),
                e.getOwner() != null ? e.getOwner().getUsername() : null,
                e.isHumanReviewed(),
                e.getTeacherNote(),
                e.getReviewer() != null ? e.getReviewer().getUsername() : null,
                e.getReviewedAt(),
                ai.criteria(),
                override != null ? override : ai.criteria());
    }
}