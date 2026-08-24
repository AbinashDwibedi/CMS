package com.abinash.campus_management.repository;

import com.abinash.campus_management.dto.RegistrationResponse;
import com.abinash.campus_management.entity.EventRegistrations;
import com.abinash.campus_management.entity.Events;
import com.abinash.campus_management.entity.Students;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistrations, Long> {
    @Query("SELECT new com.abinash.campus_management.dto.RegistrationResponse(reg.id,e.id,e.title,e.venue,e.startTime,s.id,s.name,s.rollNumber,s.email,s.department,reg.registeredAt) FROM EventRegistrations reg JOIN reg.event e JOIN reg.student s WHERE e.id = :eventId")
    List<RegistrationResponse> findAllByClubId(@Param("eventId") Long eventId);

    interface RegistrationTrendProjection {
        LocalDate getDate();
        Long getRegistrationCount();
    }

    boolean existsByEventAndStudent(Events event, Students student);

    Optional<EventRegistrations> findByEventAndStudent(Events event, Students student);

    @Query("SELECT r.event.id FROM EventRegistrations r WHERE r.student = :student")
    Set<Long> findEventIdsByStudent(@Param("student") Students student);

    int countByEvent(Events event);

    @Query("SELECT FUNCTION('DATE', er.registeredAt) AS date, COUNT(er.id) AS registrationCount " +
           "FROM EventRegistrations er " +
           "GROUP BY FUNCTION('DATE', er.registeredAt) " +
           "ORDER BY FUNCTION('DATE', er.registeredAt) ASC")
    List<RegistrationTrendProjection> findRegistrationTrends();
}
