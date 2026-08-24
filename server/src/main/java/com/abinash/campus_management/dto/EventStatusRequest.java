package com.abinash.campus_management.dto;

import com.abinash.campus_management.enums.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventStatusRequest {

    @NotNull(message = "Status cannot be null")
    private Status status;
}
