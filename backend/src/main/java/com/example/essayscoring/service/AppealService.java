package com.example.essayscoring.service;

import com.example.essayscoring.dto.AppealInfo;
import com.example.essayscoring.dto.ResolveAppealRequest;
import com.example.essayscoring.entity.Appeal;
import com.example.essayscoring.entity.AppealStatus;
import com.example.essayscoring.entity.EssayResult;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.AppealRepository;
import com.example.essayscoring.repository.EssayResultRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AppealService {

    private static final List<String> KEYS = CriteriaKeys.ALL;
    private static final double MAX_SCORE = 10.0;

    private final AppealRepository appeals;
    private final EssayResultRepository essays;
    private final EssayService essayService;
    private final AssignmentService assignments;

    public AppealService(AppealRepository appeals, EssayResultRepository essays,
            EssayService essayService, AssignmentService assignments) {
        this.appeals = appeals;
        this.essays = essays;
        this.essayService = essayService;
        this.assignments = assignments;
    }

    /**
     * Học sinh gửi khiếu nại cho bài của chính mình. Mỗi bài chỉ được khiếu nại 1
     * lần.
     */
    @Transactional
    public AppealInfo create(Long essayId, String reason, User student) {
        EssayResult essay = essays.findById(essayId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài"));

        boolean isOwner = essay.getOwner() != null && essay.getOwner().getId().equals(student.getId());
        if (!isOwner) {
            // Trả 404 giống EssayService để không lộ việc bài có tồn tại
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài");
        }
        if (appeals.existsByEssay(essay)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bài này đã được khiếu nại trước đó");
        }

        Appeal appeal = new Appeal();
        appeal.setEssay(essay);
        appeal.setStudent(student);
        appeal.setReason(reason.trim());
        appeal.setOriginalScore(essay.getScore());
        return toInfo(appeals.save(appeal));
    }

    /** Khiếu nại của chính người dùng. */
    @Transactional(readOnly = true)
    public List<AppealInfo> mine(User student) {
        return appeals.findAllByStudentOrderByCreatedAtDesc(student).stream().map(this::toInfo).toList();
    }

    /** ADMIN xem tất cả, có thể lọc theo trạng thái. */
    @Transactional(readOnly = true)
    public List<AppealInfo> list(AppealStatus status) {
        List<Appeal> list = status == null
                ? appeals.findAllByOrderByCreatedAtDesc()
                : appeals.findAllByStatusOrderByCreatedAtDesc(status);
        return list.stream().map(this::toInfo).toList();
    }

    /** Người chấm (ADMIN) quyết định: chấp nhận + chấm lại, hoặc từ chối. */
    @Transactional
    public AppealInfo resolve(Long id, ResolveAppealRequest req, User reviewer) {
        Appeal appeal = appeals.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khiếu nại"));

        if (appeal.getStatus() != AppealStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Khiếu nại này đã được xử lý");
        }
        if (appeal.getStudent().getId().equals(reviewer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự xử lý khiếu nại của chính mình");
        }
        if (req.status() == AppealStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quyết định phải là APPROVED hoặc REJECTED");
        }

        if (req.status() == AppealStatus.APPROVED) {
            Map<String, Double> criteria = validateCriteria(req.criteria());
            EssayResult essay = appeal.getEssay();
            double newScore = assignments.computeTotal(criteria, essay.getAssignment());
            essay.setScore(newScore); // điểm cuối cùng = điểm tính từ 3 tiêu chí của người chấm
            essay.setCriteriaOverrideJson(essayService.writeCriteria(criteria));
            essay.setHumanReviewed(true);
            essays.save(essay);
            appeal.setNewScore(newScore);
        }

        appeal.setStatus(req.status());
        appeal.setReviewerNote(req.note().trim());
        appeal.setReviewer(reviewer);
        appeal.setResolvedAt(LocalDateTime.now());
        return toInfo(appeals.save(appeal));
    }

    private Map<String, Double> validateCriteria(Map<String, Double> criteria) {
        if (criteria == null || !criteria.keySet().equals(Set.copyOf(KEYS))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cần nhập đủ " + KEYS.size() + " tiêu chí: " + String.join(", ", KEYS));
        }
        Map<String, Double> clean = new LinkedHashMap<>();
        for (String k : KEYS) {
            Double v = criteria.get(k);
            if (v == null || v < 0 || v > MAX_SCORE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Điểm tiêu chí phải từ 0 đến " + (int) MAX_SCORE);
            }
            clean.put(k, v);
        }
        return clean;
    }

    private AppealInfo toInfo(Appeal a) {
        return new AppealInfo(
                a.getId(),
                a.getEssay().getId(),
                a.getStudent().getUsername(),
                a.getReason(),
                a.getStatus().name(),
                a.getOriginalScore(),
                a.getNewScore(),
                a.getReviewerNote(),
                a.getReviewer() != null ? a.getReviewer().getUsername() : null,
                a.getCreatedAt(),
                a.getResolvedAt());
    }
}