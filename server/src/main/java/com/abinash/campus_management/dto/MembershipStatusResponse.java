package com.abinash.campus_management.dto;

import com.abinash.campus_management.enums.ClubRoles;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipStatusResponse {

    private boolean joined;
    private ClubRoles role;
    private boolean hasEditAccess;
    private LocalDateTime joinedAt;
}
