package com.example.essayscoring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.essayscoring.entity.EssayResult;
import com.example.essayscoring.entity.User;


public interface EssayResultRepository extends JpaRepository<EssayResult, Long> {
    List<EssayResult> findAllByOrderByCreatedAtDesc();
    List<EssayResult> findAllByOwnerOrderByCreatedAtDesc(User owner);
    @Query("select e from EssayResult e where e.id = :rootId or e.rootId = :rootId order by e.createdAt asc, e.id asc")
    List<EssayResult> findThread(@Param("rootId") Long rootId);
}