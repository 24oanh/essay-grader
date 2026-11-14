package com.example.essayscoring.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "essay_results")
public class EssayResult {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    private double score;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String detailJson;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "human_reviewed")
    private Boolean humanReviewed = false;

    @Column(name = "root_id")
    private Long rootId; // null = bài gốc; khác null = lần nộp lại của bài có id = rootId

    @Column(columnDefinition = "TEXT")
    private String teacherNote;

    /** Điểm tiêu chí do giáo viên đặt (JSON map). null = giữ phân tích của AI. */
    @Column(columnDefinition = "TEXT")
    private String criteriaOverrideJson;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    private LocalDateTime reviewedAt;

    public String getTeacherNote() { return teacherNote; }
    public void setTeacherNote(String teacherNote) { this.teacherNote = teacherNote; }
    public String getCriteriaOverrideJson() { return criteriaOverrideJson; }
    public void setCriteriaOverrideJson(String json) { this.criteriaOverrideJson = json; }
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public Long getRootId() { return rootId; }
    public void setRootId(Long rootId) { this.rootId = rootId; }

    public Long getId() { return id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }
    public String getDetailJson() { return detailJson; }
    public void setDetailJson(String detailJson) { this.detailJson = detailJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public boolean isHumanReviewed() { return Boolean.TRUE.equals(humanReviewed); }
    public void setHumanReviewed(boolean humanReviewed) { this.humanReviewed = humanReviewed; }
}