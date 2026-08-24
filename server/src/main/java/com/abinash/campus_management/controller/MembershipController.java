package com.abinash.campus_management.controller;

import com.abinash.campus_management.dto.MembershipStatusResponse;
import com.abinash.campus_management.dto.SuccessResponse;
import com.abinash.campus_management.services.ClubMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/memberships")
public class MembershipController {
    private final ClubMembershipService membershipService;
    @GetMapping
    public ResponseEntity<SuccessResponse<MembershipStatusResponse>> getMyMembership(
            Authentication authentication,
            @RequestParam Long clubId) {
        MembershipStatusResponse response = membershipService.getMyMembership(authentication.getName(), clubId);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Membership status retrieved", response));
    }

    @PostMapping("/{club_id}")
    public ResponseEntity<SuccessResponse<Void>> createMembership(Authentication authentication, @PathVariable Long club_id){
        membershipService.createNewMembership(authentication.getName(), club_id);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SuccessResponse<>(HttpStatus.CREATED, "Membership created successfully"));
    }
    @DeleteMapping("/{club_id}")
    public ResponseEntity<SuccessResponse<Void>> deleteMembership(Authentication authentication, @PathVariable Long club_id){
        membershipService.deleteMembership(authentication.getName(), club_id);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Membership deleted successfully"));
    }



    // ADMIN End Points Starts From Here
    @PatchMapping("/{clubId}/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> toggleLeadership(@PathVariable Long clubId, @PathVariable Long userId){
        membershipService.toggleLeadership(clubId, userId);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Leadership changed successfully"));
    }
}
