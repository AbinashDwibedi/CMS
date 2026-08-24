package com.abinash.campus_management.services;

import com.abinash.campus_management.dto.StudentProfileResponse;
import com.abinash.campus_management.dto.StudentRegistrationRequest;
import com.abinash.campus_management.dto.StudentUpdateRequest;
import com.abinash.campus_management.entity.MyUser;
import com.abinash.campus_management.entity.Students;
import com.abinash.campus_management.exception.ApiException;
import com.abinash.campus_management.repository.MyUserRepository;
import com.abinash.campus_management.repository.StudentRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {
   private final ModelMapper mapper;
   private final StudentRepository studentRepository;
   private final MyUserRepository userRepository;

   @Transactional
   public StudentProfileResponse createProfile(StudentRegistrationRequest request, String loggedUserName) {
      MyUser user = userRepository.findByName(loggedUserName)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No user exists with the username"));

      if (studentRepository.existsByUser(user)) {
         throw new ApiException(HttpStatus.CONFLICT, "Student profile is already created");
      }

      Students student = Students.builder().email(request.getEmail()).name(request.getName())
            .rollNumber(request.getRollNumber()).department(request.getDepartment())
            .joiningYear(request.getJoiningYear()).user(user).build();

      Students savedStudent = studentRepository.save(student);
      user.setProfileCompleted(true);
      userRepository.save(user);
      return mapper.map(savedStudent, StudentProfileResponse.class);
   }

   public StudentProfileResponse getLoggedInStudent(String name) {
      Students student = studentRepository.findByUser_Name(name)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));

      return mapper.map(student, StudentProfileResponse.class);
   }

   @Transactional
   public StudentProfileResponse updateProfile(@Valid StudentUpdateRequest request, String name) {
      Students student = studentRepository.findByUser_Name(name)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
      student.setName(request.getName());
      student.setDepartment(request.getDepartment());
      student.setEmail(request.getEmail());

      Students updatedStudent = studentRepository.save(student);
      return mapper.map(updatedStudent, StudentProfileResponse.class);
   }

   public StudentProfileResponse getProfileByRollNumber(String rollNumber) {
      Students student = studentRepository.findByRollNumber(rollNumber)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Student not found"));
      return mapper.map(student, StudentProfileResponse.class);
   }

   public Page<StudentProfileResponse> getAllStudents(String department, String search, Pageable pageable) {
      Page<Students> studentsPage;
      studentsPage = studentRepository.findAllByDepartmentAndSearch(department, search, pageable);
      return studentsPage.map(student -> mapper.map(student, StudentProfileResponse.class));
   }
   @Transactional
   public void deleteStudentById(Long userId) {
      MyUser user = userRepository.findById(userId).orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "User account not found"));
      userRepository.delete(user);
   }
}
