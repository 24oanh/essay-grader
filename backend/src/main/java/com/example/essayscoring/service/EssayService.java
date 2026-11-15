package com.example.essayscoring.service;

import com.example.essayscoring.dto.HistoryDetail;
import com.example.essayscoring.dto.HistoryItem;
import com.example.essayscoring.dto.ProgressPoint;
import com.example.essayscoring.dto.ScoreResponse;
import com.example.essayscoring.dto.ScoreResponse.WordWeight;
import com.example.essayscoring.entity.EssayResult;
import com.example.essayscoring.entity.Role;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.entity.Assignment;
import com.example.essayscoring.repository.AppealRepository;
import com.example.essayscoring.repository.EssayResultRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.web.multipart.MultipartFile;
import com.example.essayscoring.dto.BatchScoreResult;

@Service
public class EssayService {

    private final EssayResultRepository repository;
    private final AppealRepository appeals;
    private final ObjectMapper mapper;
    private final AssignmentService assignments;
    private final ExecutorService batchPool = Executors.newFixedThreadPool(4);

    public EssayService(EssayResultRepository repository, AppealRepository appeals, ObjectMapper mapper,
            AssignmentService assignments) {
        this.repository = repository;
        this.appeals = appeals;
        this.mapper = mapper;
        this.assignments = assignments;
    }

    public ScoreResponse score(String text, Long assignmentId, User user) {
        Assignment assignment = assignmentId == null ? null : assignments.get(assignmentId);
        return scoreAndSave(text, user, null, assignment);
    }

    public ScoreResponse resubmit(Long parentId, String text, User user) {
        EssayResult parent = findAccessible(parentId, user);
        if (!isOwner(parent, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ chủ bài mới được nộp lại");
        }
        Long rootId = parent.getRootId() != null ? parent.getRootId() : parent.getId();
        return scoreAndSave(text, user, rootId, parent.getAssignment());
    }

    public List<BatchScoreResult> scoreBatch(List<MultipartFile> files, User user) {
        List<CompletableFuture<BatchScoreResult>> futures = files.stream()
                .map(f -> CompletableFuture.supplyAsync(() -> {
                    String name = f.getOriginalFilename();
                    try {
                        String text = FileTextExtractor.extract(f);
                        return new BatchScoreResult(name, true, scoreAndSave(text, user, null, null), null);
                    } catch (Exception ex) {
                        return new BatchScoreResult(name, false, null, ex.getMessage());
                    }
                }, batchPool))
                .toList();
        return futures.stream().map(CompletableFuture::join).toList();
    }

    private ScoreResponse scoreAndSave(String text, User user, Long rootId, Assignment assignment) {
        ScoreResponse response = fakeScore(text); // TODO: thay bằng ModelClientService
        if (assignment != null)
            response = assignments.applyRubric(response, assignment);

        EssayResult entity = new EssayResult();
        entity.setAssignment(assignment);
        entity.setText(text);
        entity.setScore(response.score());
        entity.setDetailJson(toJson(response));
        entity.setOwner(user);
        entity.setRootId(rootId);
        repository.save(entity);

        return response;
    }

    /** ADMIN/TEACHER thấy tất cả, USER chỉ thấy bài của mình. */
    public List<HistoryItem> history(User user) {
        List<EssayResult> list = canViewAll(user)
                ? repository.findAllByOrderByCreatedAtDesc()
                : repository.findAllByOwnerOrderByCreatedAtDesc(user);
        return list.stream()
                .map(e -> new HistoryItem(e.getId(), e.getCreatedAt(), e.getText(), e.getScore(),
                        e.getOwner() != null ? e.getOwner().getUsername() : null,
                        e.isHumanReviewed(), e.getRootId()))
                .toList();
    }

    public HistoryDetail detail(Long id, User user) {
        EssayResult e = findAccessible(id, user);
        return new HistoryDetail(e.getId(), e.getCreatedAt(), e.getText(), fromJson(e.getDetailJson()),
                e.getScore(), e.isHumanReviewed(),
                readCriteria(e.getCriteriaOverrideJson()), // [MỚI]
                e.getTeacherNote(), // [MỚI]
                e.getReviewer() != null ? e.getReviewer().getUsername() : null, // [MỚI]
                e.getReviewedAt()); // [MỚI]
    }

    /** Điểm qua các lần nộp của cùng một bài (id bất kỳ trong chuỗi đều được). */
    public List<ProgressPoint> progress(Long id, User user) {
        EssayResult e = findAccessible(id, user);
        Long rootId = e.getRootId() != null ? e.getRootId() : e.getId();

        List<ProgressPoint> points = new ArrayList<>();
        int n = 1;
        for (EssayResult r : repository.findThread(rootId)) {
            Map<String, Double> override = readCriteria(r.getCriteriaOverrideJson()); // [MỚI]
            Map<String, Double> criteria = override != null
                    ? override
                    : fromJson(r.getDetailJson()).criteria();
            points.add(new ProgressPoint(r.getId(), n++, r.getCreatedAt(), r.getScore(), criteria));
        }
        return points;
    }

    @Transactional
    public void delete(Long id, User user) {
        EssayResult e = findAccessible(id, user);
        // [MỚI] giáo viên xem được bài của học sinh nhưng không được xóa
        if (!isAdmin(user) && !isOwner(e, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xóa bài này");
        }
        appeals.deleteAllByEssay(e);
        repository.delete(e);
    }

    @Transactional
    public void deleteAll(User user) {
        // Giữ nguyên: chỉ ADMIN xóa được bài của mọi người, các vai trò khác chỉ xóa
        // bài của mình
        List<EssayResult> list = isAdmin(user)
                ? repository.findAllByOrderByCreatedAtDesc()
                : repository.findAllByOwnerOrderByCreatedAtDesc(user);
        appeals.deleteAllByEssayIn(list);
        repository.deleteAll(list);
    }

    // ---------- tiện ích ----------

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }

    /** [MỚI] ADMIN và TEACHER được xem bài của mọi người. */
    private boolean canViewAll(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.TEACHER;
    }

    private boolean isOwner(EssayResult e, User user) {
        return e.getOwner() != null && e.getOwner().getId().equals(user.getId());
    }

    private EssayResult findAccessible(Long id, User user) {
        EssayResult e = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài"));
        if (!canViewAll(user) && !isOwner(e, user)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài");
        }
        return e;
    }

    private String toJson(ScoreResponse r) {
        try {
            return mapper.writeValueAsString(r);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Không chuyển được kết quả sang JSON", ex);
        }
    }

    // package-private: TeacherService dùng chung
    ScoreResponse fromJson(String json) {
        try {
            return mapper.readValue(json, ScoreResponse.class);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Dữ liệu lưu bị lỗi", ex);
        }
    }

    Map<String, Double> readCriteria(String json) {
        if (json == null || json.isBlank())
            return null;
        try {
            return mapper.readValue(json, new TypeReference<Map<String, Double>>() {
            });
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Dữ liệu tiêu chí bị lỗi", ex);
        }
    }

    String writeCriteria(Map<String, Double> criteria) {
        try {
            return mapper.writeValueAsString(criteria);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Không chuyển được tiêu chí sang JSON", ex);
        }
    }

    // Dữ liệu giả, sau này thay bằng mô hình thật
    private ScoreResponse fakeScore(String text) {
        List<WordWeight> explanation = new ArrayList<>();
        for (String word : text.trim().split("\\s+")) {
            double weight = ((Math.abs(word.hashCode()) % 100) - 50) / 100.0;
            explanation.add(new WordWeight(word, weight));
        }
        Map<String, Double> criteria = new LinkedHashMap<>();
        criteria.put("content", 8.0);
        criteria.put("organization", 7.0);
        criteria.put("grammar", 7.5);
        criteria.put("vocabulary", 7.0);
        criteria.put("coherence", 8.0);
        return new ScoreResponse(7.5, criteria, explanation);
    }
}