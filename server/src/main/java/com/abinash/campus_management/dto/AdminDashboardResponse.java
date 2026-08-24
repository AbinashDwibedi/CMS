package com.abinash.campus_management.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class AdminDashboardResponse {

    private long totalClubs;
    private long totalEvents;
    private long totalStudentsJoined;
    private List<RegistrationTrendDTO> registrationTrends;

    @Getter
    @Builder
    public static class RegistrationTrendDTO {
        private LocalDate date;
        private long registrationCount;
    }
}
