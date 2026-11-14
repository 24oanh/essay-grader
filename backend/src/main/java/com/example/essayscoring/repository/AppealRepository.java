package com.example.essayscoring.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.essayscoring.entity.Appeal;
import com.example.essayscoring.entity.AppealStatus;
import com.example.essayscoring.entity.EssayResult;
import com.example.essayscoring.entity.User;

public interface AppealRepository extends JpaRepository<Appeal, Long> {
    List<Appeal> findAllByStudentOrderByCreatedAtDesc(User student);
    List<Appeal> findAllByOrderByCreatedAtDesc();
    List<Appeal> findAllByStatusOrderByCreatedAtDesc(AppealStatus status);
    boolean existsByEssay(EssayResult essay);

    // Dùng khi xóa bài luận (gọi trong @Transactional)
    void deleteAllByEssay(EssayResult essay);
    void deleteAllByEssayIn(Collection<EssayResult> essays);
}