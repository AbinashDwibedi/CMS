package com.abinash.campus_management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class LoginResponse {
    String name;
    String role;
    boolean isProfileCompleted;
}
