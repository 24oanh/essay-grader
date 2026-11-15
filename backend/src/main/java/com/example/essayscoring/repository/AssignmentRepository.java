package com.example.essayscoring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.essayscoring.entity.Assignment;
import com.example.essayscoring.entity.User;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findAllByOrderByCreatedAtDesc();
    List<Assignment> findAllByOwnerOrderByCreatedAtDesc(User owner);
}