package com.example.essayscoring.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.ClassStats;
import com.example.essayscoring.entity.Assignment;
import com.example.essayscoring.entity.EssayResult;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.EssayResultRepository;

@Service
public class StatsService {

    private static final int BUCKETS = 10; // thang điểm cố định 10
    private static final double OUTLIER_SD = 2.0; // lệch quá 2 độ lệch chuẩn là bất thường
    private static final int MIN_FOR_OUTLIERS = 6; // ít hơn 6 bài thì gần như không thể vượt 2 độ lệch chuẩn

    private final AssignmentService assignments;
    private final EssayResultRepository essays;
    private final EssayService essayService;

    public StatsService(AssignmentService assignments, EssayResultRepository essays, EssayService essayService) {
        this.assignments = assignments;
        this.essays = essays;
        this.essayService = essayService;
    }

    @Transactional(readOnly = true)
    public ClassStats classStats(Long assignmentId, User teacher) {
        Assignment a = ownedAssignment(assignmentId, teacher);
        List<EssayResult> list = latestSubmissions(a);
        int n = list.size();

        int[] dist = new int[BUCKETS];
        if (n == 0) {
            return new ClassStats(a.getId(), a.getTitle(), 0, null, null, null, null, null,
                    toList(dist), Map.of(), OUTLIER_SD, MIN_FOR_OUTLIERS, List.of());
        }

        double[] scores = list.stream().mapToDouble(EssayResult::getScore).toArray();
        double mean = Arrays.stream(scores).average().orElse(0);
        double sd = Math.sqrt(Arrays.stream(scores).map(s -> (s - mean) * (s - mean)).average().orElse(0));

        double[] sorted = scores.clone();
        Arrays.sort(sorted);
        double median = n % 2 == 1 ? sorted[n / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

        for (double s : scores) {
            dist[Math.min(BUCKETS - 1, Math.max(0, (int) Math.floor(s)))]++;
        }

        // Điểm trung bình từng tiêu chí (ưu tiên điểm tiêu chí do giáo viên chỉnh)
        Map<String, double[]> acc = new LinkedHashMap<>(); // [tổng, số lượng]
        for (EssayResult e : list) {
            Map<String, Double> override = essayService.readCriteria(e.getCriteriaOverrideJson());
            Map<String, Double> criteria = override != null
                    ? override
                    : essayService.fromJson(e.getDetailJson()).criteria();
            criteria.forEach((k, v) -> {
                double[] t = acc.computeIfAbsent(k, x -> new double[2]);
                t[0] += v;
                t[1] += 1;
            });
        }
        Map<String, Double> criteriaAvg = new LinkedHashMap<>();
        acc.forEach((k, t) -> criteriaAvg.put(k, round2(t[0] / t[1])));

        // Bài bất thường: điểm lệch xa trung bình lớp
        List<ClassStats.Outlier> outliers = new ArrayList<>();
        if (n >= MIN_FOR_OUTLIERS && sd > 0) {
            for (EssayResult e : list) {
                double z = (e.getScore() - mean) / sd;
                if (Math.abs(z) > OUTLIER_SD) {
                    outliers.add(new ClassStats.Outlier(e.getId(), e.getOwner().getUsername(),
                            e.getScore(), round2(z), e.getText(), e.isHumanReviewed()));
                }
            }
            outliers.sort(Comparator.comparingDouble((ClassStats.Outlier o) -> Math.abs(o.deviation())).reversed());
        }

        return new ClassStats(a.getId(), a.getTitle(), n,
                round2(mean), round2(median), sorted[n - 1], sorted[0], round2(sd),
                toList(dist), criteriaAvg, OUTLIER_SD, MIN_FOR_OUTLIERS, outliers);
    }

    public Assignment ownedAssignment(Long assignmentId, User teacher) {
        Assignment a = assignments.get(assignmentId);
        if (a.getOwner() == null || !a.getOwner().getId().equals(teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ chủ đề bài mới xem được thống kê");
        }
        return a;
    }

    /**
     * Lần nộp mới nhất của mỗi học sinh cho đề này (danh sách nguồn đã sắp xếp mới
     * nhất trước).
     */
    public List<EssayResult> latestSubmissions(Assignment a) {
        Map<Long, EssayResult> latest = new LinkedHashMap<>();
        for (EssayResult e : essays.findAllByAssignmentOrderByCreatedAtDescIdDesc(a)) {
            if (e.getOwner() != null)
                latest.putIfAbsent(e.getOwner().getId(), e);
        }
        return new ArrayList<>(latest.values());
    }

    private static double round2(double v) {
        return Math.round(v * 100) / 100.0;
    }

    private static List<Integer> toList(int[] arr) {
        return Arrays.stream(arr).boxed().toList();
    }
}