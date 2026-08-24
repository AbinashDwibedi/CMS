package com.abinash.campus_management.dto;

import com.abinash.campus_management.enums.Status;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private String venue;
    private int maxCapacity;
    private int registeredCount;
    private Status status;
    private Long clubId;
    private String clubName;
    private boolean registered;
}
