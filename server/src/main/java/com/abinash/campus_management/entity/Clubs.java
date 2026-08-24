package com.abinash.campus_management.entity;


import com.abinash.campus_management.enums.Category;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@Setter
@Getter
@Table(name = "clubs")
public class Clubs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true,nullable = false, length = 6)
    private String clubCode;
    @Column(unique = true,nullable = false)
    private String name;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Category category;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false, unique = true)
    private String contactEmail;
    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;
    @ToString.Exclude
    @Builder.Default
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Events> events = new ArrayList<>();
    @ToString.Exclude
    @Builder.Default
    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClubMemberships> memberships = new ArrayList<>();
}
