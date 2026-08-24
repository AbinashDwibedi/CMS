package com.abinash.campus_management.repository;

import com.abinash.campus_management.entity.Clubs;
import com.abinash.campus_management.enums.Category;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Clubs, Long> {

    boolean existsByNameOrClubCode(@NotBlank String name, @NotBlank String clubCode);
}
