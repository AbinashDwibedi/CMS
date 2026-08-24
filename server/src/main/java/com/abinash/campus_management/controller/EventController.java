package com.abinash.campus_management.controller;

import com.abinash.campus_management.dto.*;
import com.abinash.campus_management.enums.Authorities;
import com.abinash.campus_management.services.EventRegistrationService;
import com.abinash.campus_management.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final EventRegistrationService eventRegistrationService;

    @GetMapping
    public ResponseEntity<SuccessResponse<Page<EventResponse>>> getEvents(
            Authentication authentication,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<EventResponse> events = eventService.getVisibleEvents(authentication.getName(),search, pageable);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Events retrieved successfully", events));
    }
//    @GetMapping("/{eventId}")
//    public ResponseEntity<SuccessResponse<EventResponse>> getEvent(@PathVariable Long eventId){
//        EventResponse response = eventService.getEvent(eventId);
//        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Event retrieved successfully", response));
//    }
    @PostMapping("/{eventId}/register")
    public ResponseEntity<SuccessResponse<RegistrationResponse>> registerForEvent(
            @PathVariable Long eventId,
            Authentication authentication) {
        RegistrationResponse response = eventRegistrationService.register(eventId, authentication.getName());
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Registered for event successfully", response));
    }

    @DeleteMapping("/{eventId}/register")
    public ResponseEntity<SuccessResponse<Void>> cancelRegistration(
            @PathVariable Long eventId,
            Authentication authentication) {
        eventRegistrationService.cancelRegistration(eventId, authentication.getName());
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Registration cancelled successfully", null));
    }

    @PostMapping
    public ResponseEntity<SuccessResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventCreateRequest request,
            Authentication authentication) {
        EventResponse response = eventService.createEvent(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponse<>(HttpStatus.CREATED, "Event created successfully", response));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<SuccessResponse<Void>> deleteEvent(
            @PathVariable Long eventId,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList().getFirst().equals(Authorities.ROLE_ADMIN.name());
        eventService.deleteEvent(isAdmin,eventId, authentication.getName());
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Event deleted successfully", null));
    }

    @PatchMapping("/{eventId}/status")
    public ResponseEntity<SuccessResponse<EventResponse>> changeStatus(
            @PathVariable Long eventId,
            @Valid @RequestBody EventStatusRequest request,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList().getFirst().equals(Authorities.ROLE_ADMIN.name());
        EventResponse response = eventService.changeStatus(isAdmin,eventId, request, authentication.getName());
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Event status updated successfully", response));
    }


    // Admin Section

}
