package com.abinash.campus_management.repository;

import com.abinash.campus_management.entity.Clubs;
import com.abinash.campus_management.entity.Events;
import com.abinash.campus_management.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Events, Long> {
    @Query("SELECT er FROM Events er "+
            "WHERE er.status IN(:visibleStatus) AND "+
            "(:search IS NULL or :search = '' or LOWER(er.title) LIKE LOWER(CONCAT('%' , :search , '%')))")
    Page<Events> findByStatusIn(@Param("search") String search,@Param("visibleStatus") List<Status> visibleStatus, Pageable pageable);

    Page<Events> findByClubId(Long id, Pageable pageable);
}
