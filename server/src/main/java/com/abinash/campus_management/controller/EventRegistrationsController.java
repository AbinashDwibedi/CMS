package com.abinash.campus_management.controller;

import com.abinash.campus_management.dto.RegistrationResponse;
import com.abinash.campus_management.dto.SuccessResponse;
import com.abinash.campus_management.services.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/event-registrations")
public class EventRegistrationsController {
    private final EventRegistrationService registrationService;
    @GetMapping
    public ResponseEntity<SuccessResponse<List<RegistrationResponse>>> getAllRegistrations(@RequestParam Long eventId){
        List<RegistrationResponse> responses = registrationService.findAllByEventId(eventId);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Event registrations retrieved successfully", responses));
    }
}
