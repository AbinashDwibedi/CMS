package com.abinash.campus_management.repository;

import com.abinash.campus_management.entity.MyUser;
import com.abinash.campus_management.entity.Students;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Students, Long> {
    boolean existsByUser(MyUser loggedUserName);

    Optional<Students> findByUser_Name(String name);

    Optional<Students> findByRollNumber(String rollNumber);

//    Page<Students> findByDepartmentAndJoiningYear(String department, String joiningYear, Pageable pageable);

    Optional<Students> findByUser_Id(Long userId);

    @Query("SELECT st FROM Students st JOIN FETCH st.user u WHERE (:department IS NULL OR :department = '' OR LOWER(st.department) LIKE LOWER(CONCAT('%',:department,'%'))) AND (:search IS NULL OR :search = '' OR LOWER(st.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%',:search,'%')))")
    Page<Students> findAllByDepartmentAndSearch(String department, String search, Pageable pageable);
}
