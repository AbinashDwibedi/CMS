package com.abinash.campus_management.controller;

import com.abinash.campus_management.dto.AdminDashboardResponse;
import com.abinash.campus_management.dto.SuccessResponse;
import com.abinash.campus_management.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<SuccessResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse data = dashboardService.getAdminDashboardData();
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Dashboard data retrieved successfully", data));
    }
}
