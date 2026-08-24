package com.abinash.campus_management.dto;

import com.abinash.campus_management.enums.Category;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ClubCreationRequest {
    @NotBlank
    private String clubCode;
    @NotBlank
    private String name;

    @NotNull
    private Category category;

    @NotBlank
    private String description;

    @NotBlank
    @Email
    private String contactEmail;
}