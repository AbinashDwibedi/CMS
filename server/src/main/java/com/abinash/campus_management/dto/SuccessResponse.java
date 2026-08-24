package com.abinash.campus_management.dto;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
public class SuccessResponse<T> {
    private final boolean success = true;
    private final HttpStatus status;
    private final String message;
    private final T data;
    private final LocalDateTime timestamp;
    public SuccessResponse(HttpStatus status, String message, T data){
        this.status = status;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    public SuccessResponse(HttpStatus status, String message){
        this(status,message,null);
    }


}
