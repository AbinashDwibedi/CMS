package com.abinash.campus_management.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {

    private Long registrationId;
    private Long eventId;
    private String eventTitle;
    private String eventVenue;
    private LocalDateTime eventStartTime;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private String studentEmail;
    private String studentDepartment;
    private LocalDateTime registeredAt;
}
