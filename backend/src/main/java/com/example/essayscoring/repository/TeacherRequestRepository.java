package com.example.essayscoring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.essayscoring.entity.TeacherRequest;
import com.example.essayscoring.entity.TeacherRequestStatus;
import com.example.essayscoring.entity.User;

public interface TeacherRequestRepository extends JpaRepository<TeacherRequest, Long> {
    List<TeacherRequest> findAllByUserOrderByCreatedAtDesc(User user);
    List<TeacherRequest> findAllByOrderByCreatedAtDesc();
    List<TeacherRequest> findAllByStatusOrderByCreatedAtDesc(TeacherRequestStatus status);
    boolean existsByUserAndStatus(User user, TeacherRequestStatus status);
}