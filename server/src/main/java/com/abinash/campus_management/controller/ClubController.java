package com.abinash.campus_management.controller;

import com.abinash.campus_management.dto.*;
import com.abinash.campus_management.repository.ClubRepository;
import com.abinash.campus_management.services.ClubService;
import com.abinash.campus_management.services.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clubs")
public class ClubController {
    private final ClubService clubService;
    private final EventService eventService;
    @GetMapping
    public ResponseEntity<SuccessResponse<List<ClubResponse>>> getAllClubs(){
        List<ClubResponse> clubResponse = clubService.findAllClubs();
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Clubs retrieved suceessfully",clubResponse));
    }
    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<ClubResponse>> getClubById(Authentication authentication,@PathVariable long id){
        ClubResponse clubResponse = clubService.getClubById(authentication.getName(),id);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Club retrieved successfully",clubResponse));
    }
    @GetMapping("/events")
    public ResponseEntity<SuccessResponse<Page<EventResponse>>> getEventsFromClub(Authentication authentication,@RequestParam long id, Pageable pageable){
        Page<EventResponse> eventResponses = clubService.getEventsByClubId(authentication.getName(),id, pageable);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Events retrieved from the server", eventResponses));
    }

    @GetMapping("/{clubId}/members")
    public ResponseEntity<SuccessResponse<Page<ClubMembers>>> getClubMembers(@PathVariable Long clubId,@RequestParam String search,Pageable pageable){
        Page<ClubMembers> result = clubService.findClubMembers(clubId,search, pageable);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Members retrieved successfully", result));
    }

    // Things that can only changed by the admin
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SuccessResponse<Void>> createClub(@Valid @RequestBody ClubCreationRequest request){
        clubService.createClub(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SuccessResponse<>(HttpStatus.CREATED, "Club created successfully", null ));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{clubId}")
    public ResponseEntity<SuccessResponse<Void>> updateClub(@Valid @RequestBody ClubCreationRequest request, @PathVariable Long clubId){
        clubService.updateClub(request, clubId);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Club updated successfully"));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{clubId}")
    public ResponseEntity<SuccessResponse<Void>> deleteClub(@PathVariable Long clubId){
        clubService.deleteClub(clubId);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Club deleted successfully"));
    }

}
