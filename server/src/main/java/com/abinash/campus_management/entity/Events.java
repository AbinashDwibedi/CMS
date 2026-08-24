package com.abinash.campus_management.entity;

import com.abinash.campus_management.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "events",
indexes = {
        @Index(name = "idx_events_club",columnList = "club_id"),
        @Index(name = "idx_events_status_time",columnList = "status, start_time")
})
public class Events {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false,columnDefinition = "TEXT" )
    private String description;
    @Column(nullable = false,name = "start_time")
    private LocalDateTime startTime;
    @Column(nullable = false)
    private String venue;
    @Column(nullable = false)
    private int maxCapacity;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id",nullable = false)
    private Clubs club;
    @Builder.Default
    @ToString.Exclude
    @OneToMany(mappedBy = "event",cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventRegistrations> registrations = new ArrayList<>();
}
