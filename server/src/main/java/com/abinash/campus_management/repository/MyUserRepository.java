package com.abinash.campus_management.repository;

import com.abinash.campus_management.entity.MyUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MyUserRepository extends JpaRepository<MyUser, Long>{
    public Optional<MyUser> findByName(String name);
}
