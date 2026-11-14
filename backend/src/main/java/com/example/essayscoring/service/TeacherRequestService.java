package com.example.essayscoring.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.TeacherRequestCreate;
import com.example.essayscoring.dto.TeacherRequestDecision;
import com.example.essayscoring.dto.TeacherRequestInfo;
import com.example.essayscoring.entity.Role;
import com.example.essayscoring.entity.TeacherRequest;
import com.example.essayscoring.entity.TeacherRequestStatus;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.TeacherRequestRepository;
import com.example.essayscoring.repository.UserRepository;

@Service
public class TeacherRequestService {

    private final TeacherRequestRepository requests;
    private final UserRepository users;

    public TeacherRequestService(TeacherRequestRepository requests, UserRepository users) {
        this.requests = requests;
        this.users = users;
    }

    /** Người dùng (USER) gửi đơn xin trở thành giáo viên. */
    @Transactional
    public TeacherRequestInfo create(TeacherRequestCreate req, User user) {
        if (user.getRole() != Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tài khoản của bạn đã là giáo viên hoặc quản trị viên");
        }
        if (requests.existsByUserAndStatus(user, TeacherRequestStatus.PENDING)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã có đơn đang chờ duyệt");
        }
        TeacherRequest r = new TeacherRequest();
        r.setUser(user);
        r.setFullName(req.fullName().trim());
        r.setOrganization(req.organization().trim());
        r.setReason(req.reason().trim());
        return toInfo(requests.save(r));
    }

    @Transactional(readOnly = true)
    public List<TeacherRequestInfo> mine(User user) {
        return requests.findAllByUserOrderByCreatedAtDesc(user).stream().map(this::toInfo).toList();
    }

    @Transactional(readOnly = true)
    public List<TeacherRequestInfo> list(TeacherRequestStatus status) {
        List<TeacherRequest> list = status == null
                ? requests.findAllByOrderByCreatedAtDesc()
                : requests.findAllByStatusOrderByCreatedAtDesc(status);
        return list.stream().map(this::toInfo).toList();
    }

    /** ADMIN duyệt: APPROVED thì tài khoản trở thành TEACHER. */
    @Transactional
    public TeacherRequestInfo resolve(Long id, TeacherRequestDecision d, User admin) {
        TeacherRequest r = requests.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn"));

        if (r.getStatus() != TeacherRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn này đã được xử lý");
        }
        if (d.status() == TeacherRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quyết định phải là APPROVED hoặc REJECTED");
        }
        if (d.status() == TeacherRequestStatus.REJECTED && (d.note() == null || d.note().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng ghi lý do từ chối");
        }

        if (d.status() == TeacherRequestStatus.APPROVED) {
            User applicant = r.getUser();
            applicant.setRole(Role.TEACHER);
            users.save(applicant);
        }

        r.setStatus(d.status());
        r.setAdminNote(d.note() == null ? null : d.note().trim());
        r.setReviewer(admin);
        r.setResolvedAt(LocalDateTime.now());
        return toInfo(requests.save(r));
    }

    private TeacherRequestInfo toInfo(TeacherRequest r) {
        return new TeacherRequestInfo(
                r.getId(), r.getUser().getUsername(), r.getFullName(), r.getOrganization(),
                r.getReason(), r.getStatus().name(), r.getAdminNote(),
                r.getReviewer() != null ? r.getReviewer().getUsername() : null,
                r.getCreatedAt(), r.getResolvedAt());
    }
}