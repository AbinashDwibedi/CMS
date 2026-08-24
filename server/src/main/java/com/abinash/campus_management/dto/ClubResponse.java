package com.abinash.campus_management.dto;

import com.abinash.campus_management.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ClubResponse {
    private Long id;
    private String clubCode;
    private String name;
    private String description;
    private Category category;
    private String contactEmail;
    private boolean isActive = true;
    private boolean joined = false;
}
