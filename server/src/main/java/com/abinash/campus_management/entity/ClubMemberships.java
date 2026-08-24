package com.abinash.campus_management.entity;

import com.abinash.campus_management.enums.ClubRoles;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"club", "user"})
@Table(name = "club_memberships",
        uniqueConstraints = {@UniqueConstraint(name = "club_user", columnNames = {"club_id","user_id"})},
        indexes = {
            @Index(name = "idx_membership_club",columnList = "club_id"),
                @Index(name = "idx_membership_user",columnList = "user_id")
        })
public class ClubMemberships {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "club_id", nullable = false)
    private Clubs club;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private MyUser user;
    @Builder.Default
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ClubRoles role = ClubRoles.MEMBER;
    @Builder.Default
    @Column(name = "has_edit_access",nullable = false)
    private boolean hasEditAccess = false;
    @CreationTimestamp
    @Column(name = "joined_at", nullable = false,updatable = false)
    private LocalDateTime joinedAt;
}
