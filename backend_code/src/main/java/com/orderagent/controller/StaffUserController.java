package com.orderagent.controller;

import com.orderagent.dto.AuthResponse;
import com.orderagent.dto.CreateStaffRequest;
import com.orderagent.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

// Restricted further to ADMIN only (creating staff accounts is an admin action,
// unlike the rest of /api/staff/** which STAFF can also use).
@RestController
@RequestMapping("/api/staff/users")
@RequiredArgsConstructor
public class StaffUserController {

    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createStaff(request));
    }
}
