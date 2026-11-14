package com.example.essayscoring.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.essayscoring.dto.EssayRequest;
import com.example.essayscoring.dto.HistoryDetail;
import com.example.essayscoring.dto.HistoryItem;
import com.example.essayscoring.dto.ProgressPoint;
import com.example.essayscoring.dto.ScoreResponse;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import com.example.essayscoring.service.EssayService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/essays")
public class EssayController {

    private final EssayService essayService;
    private final UserRepository users;

    public EssayController(EssayService essayService, UserRepository users) {
        this.essayService = essayService;
        this.users = users;
    }

    private User current(Authentication auth) {
        return users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    @PostMapping("/score")
    public ScoreResponse score(@Valid @RequestBody EssayRequest request, Authentication auth) {
        return essayService.score(request.text(), current(auth));
    }

    @GetMapping
    public List<HistoryItem> history(Authentication auth) {
        return essayService.history(current(auth));
    }

    @GetMapping("/{id}")
    public HistoryDetail detail(@PathVariable Long id, Authentication auth) {
        return essayService.detail(id, current(auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        essayService.delete(id, current(auth));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll(Authentication auth) {
        essayService.deleteAll(current(auth));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resubmit")
    public ScoreResponse resubmit(@PathVariable Long id,
                                @Valid @RequestBody EssayRequest request,
                                Authentication auth) {
        return essayService.resubmit(id, request.text(), current(auth));
    }

    @GetMapping("/{id}/progress")
    public List<ProgressPoint> progress(@PathVariable Long id, Authentication auth) {
        return essayService.progress(id, current(auth));
    }
}