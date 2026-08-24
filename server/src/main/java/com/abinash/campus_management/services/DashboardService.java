package com.abinash.campus_management.services;

import com.abinash.campus_management.dto.AdminDashboardResponse;
import com.abinash.campus_management.repository.ClubRepository;
import com.abinash.campus_management.repository.EventRegistrationRepository;
import com.abinash.campus_management.repository.EventRepository;
import com.abinash.campus_management.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final EventRegistrationRepository registrationRepository;

    public AdminDashboardResponse getAdminDashboardData() {
        long clubCount   = clubRepository.count();
        long eventCount  = eventRepository.count();
        long studentCount = studentRepository.count();

        List<AdminDashboardResponse.RegistrationTrendDTO> trends = registrationRepository
                .findRegistrationTrends()
                .stream()
                .map(p -> AdminDashboardResponse.RegistrationTrendDTO.builder()
                        .date(p.getDate())
                        .registrationCount(p.getRegistrationCount())
                        .build())
                .toList();

        return AdminDashboardResponse.builder()
                .totalClubs(clubCount)
                .totalEvents(eventCount)
                .totalStudentsJoined(studentCount)
                .registrationTrends(trends)
                .build();
    }
}
