package com.abinash.campus_management.repository;

import com.abinash.campus_management.entity.ClubMemberships;
import com.abinash.campus_management.entity.Clubs;
import com.abinash.campus_management.entity.MyUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMembershipRepository extends JpaRepository<ClubMemberships, Long> {

    Optional<ClubMemberships> findByUserAndClub(MyUser user, Clubs club);

    Optional<ClubMemberships> findFirstByUserAndHasEditAccessTrue(MyUser user);

    boolean existsByUser_NameAndClub_Id(String name, long id);

    Optional<ClubMemberships> findByUser_IdAndClub_Id(Long userId, Long clubId);

    @Query("SELECT cm FROM ClubMemberships cm " +
            "JOIN FETCH cm.user u " +
            "JOIN FETCH u.student s " +
            "WHERE cm.club.id = :clubId " +
            "AND (:search IS NULL OR :search = '' OR " +
            "     LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "     LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "     LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "     LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ClubMemberships> findMemberByClubIdAndSearch(@Param("clubId") Long clubId,@Param("search") String search, Pageable pageable);
}
