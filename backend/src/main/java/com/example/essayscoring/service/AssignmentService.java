package com.example.essayscoring.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.AssignmentRequest;
import com.example.essayscoring.dto.AssignmentResponse;
import com.example.essayscoring.dto.RubricItem;
import com.example.essayscoring.dto.ScoreResponse;
import com.example.essayscoring.dto.AssignmentSummary;
import com.example.essayscoring.entity.Assignment;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.AssignmentRepository;
import com.example.essayscoring.repository.EssayResultRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AssignmentService {

    private static final List<String> KEYS = CriteriaKeys.ALL;

    private final AssignmentRepository repository;
    private final EssayResultRepository essays;
    private final ObjectMapper mapper;

    public AssignmentService(AssignmentRepository repository, EssayResultRepository essays, ObjectMapper mapper) {
        this.repository = repository;
        this.essays = essays;
        this.mapper = mapper;
    }

    /** Danh sách công khai cho mọi người dùng: không kèm rubric. */
    @Transactional(readOnly = true)
    public List<AssignmentSummary> listAll() {
        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(a -> new AssignmentSummary(a.getId(), a.getTitle(), a.getDescription(),
                        a.getOwner() != null ? a.getOwner().getUsername() : null, a.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> listMine(User teacher) {
        return repository.findAllByOwnerOrderByCreatedAtDesc(teacher).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AssignmentResponse create(AssignmentRequest req, User teacher) {
        Assignment a = new Assignment();
        a.setOwner(teacher);
        apply(a, req);
        return toResponse(repository.save(a));
    }

    @Transactional
    public AssignmentResponse update(Long id, AssignmentRequest req, User teacher) {
        Assignment a = findOwned(id, teacher);
        apply(a, req);
        return toResponse(repository.save(a));
    }

    @Transactional
    public void delete(Long id, User teacher) {
        Assignment a = findOwned(id, teacher);
        essays.detachAssignment(a); // bài đã nộp vẫn giữ, chỉ bỏ liên kết đề
        repository.delete(a);
    }

    public Assignment get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đề bài"));
    }

    /**
     * Tính lại điểm tổng theo trọng số rubric (tổng trọng số = 100), làm tròn 0.1.
     */
    public ScoreResponse applyRubric(ScoreResponse r, Assignment a) {
        return new ScoreResponse(computeTotal(r.criteria(), a), r.criteria(), r.explanation());
    }

    /**
     * Điểm tổng từ điểm tiêu chí: theo trọng số rubric nếu có đề, không có đề thì
     * trung bình cộng.
     */
    public double computeTotal(Map<String, Double> criteria, Assignment a) {
        double total;
        if (a == null) {
            total = criteria.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);
        } else {
            total = 0;
            for (Map.Entry<String, RubricItem> e : readRubric(a.getRubricJson()).entrySet()) {
                Double v = criteria.get(e.getKey());
                if (v != null)
                    total += v * e.getValue().weight() / 100.0;
            }
        }
        return Math.round(total * 10) / 10.0;
    }

    // ---------- tiện ích ----------

    private Assignment findOwned(Long id, User teacher) {
        Assignment a = get(id);
        if (a.getOwner() == null || !a.getOwner().getId().equals(teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ chủ đề bài mới được sửa hoặc xóa");
        }
        return a;
    }

    private void apply(Assignment a, AssignmentRequest req) {
        a.setTitle(req.title().trim());
        a.setDescription(req.description() == null ? null : req.description().trim());
        a.setRubricJson(writeRubric(validateRubric(req.rubric())));
    }

    private Map<String, RubricItem> validateRubric(Map<String, RubricItem> rubric) {
        if (!rubric.keySet().equals(Set.copyOf(KEYS))) {
            throw bad("Rubric phải có đủ 5 tiêu chí: " + String.join(", ", KEYS));
        }
        double sum = 0;
        Map<String, RubricItem> clean = new LinkedHashMap<>();
        for (String k : KEYS) {
            RubricItem it = rubric.get(k);
            if (it == null || it.weight() < 0 || it.weight() > 100) {
                throw bad("Trọng số phải từ 0 đến 100");
            }
            String d = it.description() == null ? "" : it.description().trim();
            if (d.length() > 500)
                throw bad("Mô tả tiêu chí tối đa 500 ký tự");
            sum += it.weight();
            clean.put(k, new RubricItem(it.weight(), d));
        }
        if (Math.abs(sum - 100) > 0.01)
            throw bad("Tổng trọng số phải bằng 100");
        return clean;
    }

    private ResponseStatusException bad(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }

    private AssignmentResponse toResponse(Assignment a) {
        return new AssignmentResponse(a.getId(), a.getTitle(), a.getDescription(),
                readRubric(a.getRubricJson()),
                a.getOwner() != null ? a.getOwner().getUsername() : null,
                a.getCreatedAt());
    }

    private String writeRubric(Map<String, RubricItem> rubric) {
        try {
            return mapper.writeValueAsString(rubric);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Không chuyển được rubric sang JSON", ex);
        }
    }

    private Map<String, RubricItem> readRubric(String json) {
        try {
            return mapper.readValue(json, new TypeReference<LinkedHashMap<String, RubricItem>>() {
            });
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Dữ liệu rubric bị lỗi", ex);
        }
    }
}