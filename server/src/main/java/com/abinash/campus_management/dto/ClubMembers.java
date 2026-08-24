package com.abinash.campus_management.dto;

import com.abinash.campus_management.enums.ClubRoles;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMembers {

    private Long userId;
    private String name;         // MyUser username
    private String studentName;  // Student full name
    private String rollNumber;
    private String email;
    private String department;
    private ClubRoles role;
    private boolean hasEditAccess;
}