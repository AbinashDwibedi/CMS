package com.abinash.campus_management.services;

import com.abinash.campus_management.dto.MembershipStatusResponse;
import com.abinash.campus_management.entity.ClubMemberships;
import com.abinash.campus_management.entity.Clubs;
import com.abinash.campus_management.entity.MyUser;
import com.abinash.campus_management.enums.ClubRoles;
import com.abinash.campus_management.exception.ApiException;
import com.abinash.campus_management.repository.ClubMembershipRepository;
import com.abinash.campus_management.repository.ClubRepository;
import com.abinash.campus_management.repository.MyUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClubMembershipService {
    private final ClubMembershipRepository membershipRepository;
    private final MyUserRepository userRepository;
    private final ClubRepository clubRepository;

    @Transactional
    public void createNewMembership(String name, Long clubId) {
        MyUser user = userRepository.findByName(name).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND,"User is not found"));
        Clubs club = clubRepository.findById(clubId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Club not found"));

        ClubMemberships membership = ClubMemberships.builder()
                .club(club)
                .user(user)
                .build();
        membershipRepository.save(membership);
    }
    @Transactional
    public void deleteMembership(String name, Long clubId) {
        MyUser user = userRepository.findByName(name).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND,"User is not found"));
        Clubs club = clubRepository.findById(clubId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Club not found"));
        ClubMemberships clubMembership = membershipRepository.findByUserAndClub(user,club).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Membership not found"));
        membershipRepository.delete(clubMembership);
    }
    @Transactional
    public void toggleLeadership(Long clubId, Long userId) {
        ClubMemberships memberships = membershipRepository.findByUser_IdAndClub_Id(userId,clubId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Membership not found"));

        if(memberships.getRole() == ClubRoles.LEADER){
            memberships.setHasEditAccess(false);
            memberships.setRole(ClubRoles.MEMBER);
        }
        else{
            memberships.setHasEditAccess(true);
            memberships.setRole(ClubRoles.LEADER);
        }

    }
    public MembershipStatusResponse getMyMembership(String username, Long clubId) {
        MyUser user = userRepository.findByName(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Clubs club = clubRepository.findById(clubId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Club not found"));

        return membershipRepository.findByUserAndClub(user, club)
                .map(m -> MembershipStatusResponse.builder()
                        .joined(true)
                        .role(m.getRole())
                        .hasEditAccess(m.isHasEditAccess())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .orElse(MembershipStatusResponse.builder()
                        .joined(false)
                        .build());
    }
}
