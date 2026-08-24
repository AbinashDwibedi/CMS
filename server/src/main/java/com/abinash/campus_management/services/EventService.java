package com.abinash.campus_management.services;

import com.abinash.campus_management.dto.EventCreateRequest;
import com.abinash.campus_management.dto.EventResponse;
import com.abinash.campus_management.dto.EventStatusRequest;
import com.abinash.campus_management.entity.*;

import com.abinash.campus_management.enums.ClubRoles;
import com.abinash.campus_management.enums.Status;
import com.abinash.campus_management.exception.ApiException;
import com.abinash.campus_management.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;
    private final MyUserRepository userRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository membershipRepository;
    private final ModelMapper mapper;

    @Transactional
    public Page<EventResponse> getVisibleEvents(String username, String search, Pageable pageable) {
        Students student = studentRepository.findByUser_Name(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student profile not found"));

        List<Status> visibleStatuses = List.of(Status.UPCOMING, Status.ONGOING);

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                10,
                Sort.by(Sort.Direction.ASC, "startTime")
        );

        Page<Events> eventsPage = eventRepository.findByStatusIn(search,visibleStatuses, sortedPageable);
        Set<Long> registeredEventIds = registrationRepository.findEventIdsByStudent(student);

        return eventsPage.map(event -> toResponse(event, registeredEventIds));
    }

    @Transactional
    public EventResponse createEvent(EventCreateRequest request, String username) {
        MyUser user = userRepository.findByName(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        Clubs club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Club not found"));

        ClubMemberships memberships = membershipRepository.findByUserAndClub(user, club)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.FORBIDDEN, "You are not a member of this club"));
        if(!memberships.isHasEditAccess() || (memberships.getRole() != ClubRoles.LEADER)){
            throw new ApiException(HttpStatus.FORBIDDEN,"User don't have enough permission to create an event.");
        }
        Events event = Events.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .venue(request.getVenue())
                .maxCapacity(request.getMaxCapacity())
                .status(Status.UPCOMING)
                .club(club)
                .build();

        Events saved = eventRepository.save(event);
        return toResponse(saved, Set.of());
    }

    @Transactional
    public void deleteEvent(boolean isAdmin, Long eventId, String username) {

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));
        if(!isAdmin) {
            MyUser user = userRepository.findByName(username)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
            ClubMemberships memberships = membershipRepository.findByUserAndClub(user, event.getClub())
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.FORBIDDEN, "You are not a member of this club"));
            if (!memberships.isHasEditAccess() || memberships.getRole() != ClubRoles.LEADER) {
                throw new ApiException(HttpStatus.FORBIDDEN, "User doesn't have enough access to delete the event");
            }
        }
        eventRepository.delete(event);
    }

    @Transactional
    public EventResponse changeStatus(boolean isAdmin, Long eventId, EventStatusRequest request, String username) {

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));


        if(!isAdmin){
            MyUser user = userRepository.findByName(username)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
            ClubMemberships memberships = membershipRepository.findByUserAndClub(user, event.getClub())
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.FORBIDDEN, "You are not a member of this club"));
            if(!memberships.isHasEditAccess() || memberships.getRole() != ClubRoles.LEADER) {
                throw new ApiException(HttpStatus.FORBIDDEN, "User doesn't have enough permission to change the status of the event.");
            }
        }

        event.setStatus(request.getStatus());
        Events updated = eventRepository.save(event);
        return toResponse(updated, Set.of());
    }

    private EventResponse toResponse(Events event, Set<Long> registeredEventIds) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startTime(event.getStartTime())
                .venue(event.getVenue())
                .maxCapacity(event.getMaxCapacity())
                .registeredCount(event.getRegistrations().size())
                .status(event.getStatus())
                .clubId(event.getClub().getId())
                .clubName(event.getClub().getName())
                .registered(registeredEventIds.contains(event.getId()))
                .build();
    }
//
//    public EventResponse getEvent(Long eventId) {
//        Events event = eventRepository.findById(eventId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND,"Event not found"));
//        return mapper.map(event, EventResponse.class);
//    }
}
