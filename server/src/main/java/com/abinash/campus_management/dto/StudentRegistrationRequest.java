package com.abinash.campus_management.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegistrationRequest {

    @NotBlank(message = "Roll number cannot be blank")
    private String rollNumber;

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Department cannot be blank")
    private String department;

    @NotNull(message = "Joining year cannot be null")
    @Min(value = 2000, message = "Joining year must be 2000 or later")
    @Max(value = 2100, message = "Joining year must be 2100 or earlier")
    private Integer joiningYear;
}
