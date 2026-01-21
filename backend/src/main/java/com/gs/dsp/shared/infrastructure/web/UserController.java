package com.gs.dsp.shared.infrastructure.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller for user-related endpoints.
 * Phase 1: Returns hardcoded ADMIN user for development.
 * Future: Integrate with IAM system for real authentication.
 */
@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        // Phase 1: Hardcoded ADMIN role for development
        return ResponseEntity.ok(Map.of(
            "id", "admin-user",
            "username", "admin",
            "role", "ADMIN"
        ));
    }
}
