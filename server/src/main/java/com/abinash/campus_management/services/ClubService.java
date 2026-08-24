package com.abinash.campus_management.services;

import com.abinash.campus_management.dto.ClubCreationRequest;
import com.abinash.campus_management.dto.ClubMembers;
import com.abinash.campus_management.dto.ClubResponse;
import com.abinash.campus_management.dto.EventResponse;
import com.abinash.campus_management.entity.*;
import com.abinash.campus_management.exception.ApiException;
import com.abinash.campus_management.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ClubService {
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;
    private final EventRegistrationRepository registrationRepository;
    private final ModelMapper mapper;
    private final MyUserRepository myUserRepository;
    private final ClubMembershipRepository clubMembershipRepository;

    public List<ClubResponse> findAllClubs() {
        List<Clubs> clubs= clubRepository.findAll();
        return clubs.stream().map( club ->  mapper.map(club, ClubResponse.class)).toList();
    }

    public ClubResponse getClubById(String name,long id) {
        Clubs club = clubRepository.findById(id).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Club not found in the server"));
        ClubResponse response =  mapper.map(club, ClubResponse.class);
        response.setJoined(clubMembershipRepository.existsByUser_NameAndClub_Id(name,id));
        return response;
    }
    @Transactional
    public Page<EventResponse> getEventsByClubId(String name,long eventId, Pageable pageable) {
        Clubs club = clubRepository.findById(eventId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Club is not present in the server"));
        Students student = studentRepository.findByUser_Name(name).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Student is not present in the server"));

        Page<Events> events = eventRepository.findByClubId(eventId,pageable);
        Set<Long> registeredEventIds = registrationRepository.findEventIdsByStudent(student);
        return events.map(event -> toResponse(event, registeredEventIds));
    }

    private EventResponse toResponse(Events event, Set<Long> registeredEventIds) {
        return EventResponse.builder()
                .id(event.getId())
                .clubId(event.getClub().getId())
                .venue(event.getVenue())
                .title(event.getTitle())
                .registeredCount(event.getRegistrations().size())
                .clubName(event.getClub().getName())
                .registered(registeredEventIds.contains(event.getId()))
                .startTime(event.getStartTime())
                .description(event.getDescription())
                .maxCapacity(event.getMaxCapacity())
                .status(event.getStatus())
                .build();
    }




    // ADMIN SERVICES START HERE
    @Transactional
    public void createClub(ClubCreationRequest request) {
        if(clubRepository.existsByNameOrClubCode(request.getName(), request.getClubCode())){
            throw new ApiException(HttpStatus.CONFLICT,"Club already exists");
        }
        Clubs club = Clubs.builder()
                .clubCode(request.getClubCode())
                .contactEmail(request.getContactEmail())
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .build();

        clubRepository.save(club);
    }
    @Transactional
    public void updateClub(ClubCreationRequest request, Long clubId) {
        Clubs club = clubRepository.findById(clubId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Club not found"));
        club.setClubCode(request.getClubCode());
        club.setCategory(request.getCategory());
        club.setDescription(request.getDescription());
        club.setContactEmail(request.getContactEmail());
        club.setName(request.getName());
    }
    @Transactional
    public void deleteClub(Long clubId) {
        Clubs club = clubRepository.findById(clubId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Club not found"));
        clubRepository.delete(club);
    }
    @Transactional
    public Page<ClubMembers> findClubMembers(Long clubId, String search, Pageable pageable) {
        Page<ClubMemberships> membershipsPage = clubMembershipRepository.findMemberByClubIdAndSearch(clubId,search != null ? search.trim() : null,pageable);

        return membershipsPage.map(membership -> {
            MyUser user = membership.getUser();
            Students student = (user != null) ? user.getStudent() : null;
            return ClubMembers.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .studentName(student.getName())
                    .email(student.getEmail())
                    .role(membership.getRole())
                    .department(student.getDepartment())
                    .rollNumber(student.getRollNumber())
                    .hasEditAccess(membership.isHasEditAccess())
                    .build();
        });
    }
}
