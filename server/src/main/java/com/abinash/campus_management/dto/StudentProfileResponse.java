package com.abinash.campus_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponse {

    private Long userId;
    private String rollNumber;
    private String name;
    private String email;
    private String department;
    private Integer joiningYear;
    private String role;
}
