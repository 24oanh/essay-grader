package com.example.essayscoring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appeals")
public class Appeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "essay_id")
    private EssayResult essay;

    /** Học sinh/sinh viên gửi khiếu nại. */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppealStatus status = AppealStatus.PENDING;

    /** Điểm do AI chấm tại thời điểm khiếu nại (lưu lại để đối chiếu). */
    private double originalScore;

    /** Điểm do người chấm quyết định (chỉ có khi APPROVED). */
    private Double newScore;

    @Column(columnDefinition = "TEXT")
    private String reviewerNote;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    public Long getId() { return id; }
    public EssayResult getEssay() { return essay; }
    public void setEssay(EssayResult essay) { this.essay = essay; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public AppealStatus getStatus() { return status; }
    public void setStatus(AppealStatus status) { this.status = status; }
    public double getOriginalScore() { return originalScore; }
    public void setOriginalScore(double originalScore) { this.originalScore = originalScore; }
    public Double getNewScore() { return newScore; }
    public void setNewScore(Double newScore) { this.newScore = newScore; }
    public String getReviewerNote() { return reviewerNote; }
    public void setReviewerNote(String reviewerNote) { this.reviewerNote = reviewerNote; }
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}