package com.abinash.campus_management.services;

import com.abinash.campus_management.dto.RegistrationResponse;
import com.abinash.campus_management.entity.EventRegistrations;
import com.abinash.campus_management.entity.Events;
import com.abinash.campus_management.entity.Students;
import com.abinash.campus_management.enums.Status;
import com.abinash.campus_management.exception.ApiException;
import com.abinash.campus_management.repository.EventRegistrationRepository;
import com.abinash.campus_management.repository.EventRepository;
import com.abinash.campus_management.repository.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public RegistrationResponse register(Long eventId, String username) {
        Students student = studentRepository.findByUser_Name(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student profile not found"));

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getStatus() != Status.UPCOMING && event.getStatus() != Status.ONGOING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Registrations are closed for this event");
        }

        if (registrationRepository.existsByEventAndStudent(event, student)) {
            throw new ApiException(HttpStatus.CONFLICT, "Already registered for this event");
        }

        if (event.getRegistrations().size() >= event.getMaxCapacity()) {
            throw new ApiException(HttpStatus.CONFLICT, "Event is at full capacity");
        }

        EventRegistrations registration = EventRegistrations.builder()
                .event(event)
                .student(student)
                .build();

        EventRegistrations saved = registrationRepository.save(registration);

        return RegistrationResponse.builder()
                .registrationId(saved.getId())
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .eventVenue(event.getVenue())
                .eventStartTime(event.getStartTime())
                .studentId(student.getId())
                .studentName(student.getName())
                .studentRollNumber(student.getRollNumber())
                .studentEmail(student.getEmail())
                .studentDepartment(student.getDepartment())
                .registeredAt(saved.getRegisteredAt())
                .build();
    }

    @Transactional
    public void cancelRegistration(Long eventId, String username) {
        Students student = studentRepository.findByUser_Name(username)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student profile not found"));

        Events event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));

        if (event.getStatus() != Status.UPCOMING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot cancel registration for an ongoing or past event");
        }

        EventRegistrations registration = registrationRepository.findByEventAndStudent(event, student)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No registration found for this event"));

        registrationRepository.delete(registration);
    }

    public List<RegistrationResponse> findAllByEventId(Long eventId) {
        List<RegistrationResponse> responses = registrationRepository.findAllByClubId(eventId);
        return responses;
    }
}
