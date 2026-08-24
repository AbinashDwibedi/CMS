package com.abinash.campus_management.controller;

import com.abinash.campus_management.dto.StudentProfileResponse;
import com.abinash.campus_management.dto.StudentRegistrationRequest;
import com.abinash.campus_management.dto.StudentUpdateRequest;
import com.abinash.campus_management.dto.SuccessResponse;
import com.abinash.campus_management.services.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {
  private final StudentService studentService;

  @PostMapping("")
  public ResponseEntity<SuccessResponse<StudentProfileResponse>> createProfile(
      @Valid @RequestBody StudentRegistrationRequest request,
      Authentication authentication) {
    String loggedUserName = authentication.getName();
    StudentProfileResponse spr = studentService.createProfile(request, loggedUserName);
    return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Student Profile Created", spr));
  }

  @GetMapping("/me")
  public ResponseEntity<SuccessResponse<StudentProfileResponse>> getLoggedInStudent(Authentication authentication) {
    StudentProfileResponse spr = studentService.getLoggedInStudent(authentication.getName());

    return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Student retrieved successfully", spr));
  }

  @PostMapping("/me")
  public ResponseEntity<SuccessResponse<StudentProfileResponse>> updateProfile(
      @Valid @RequestBody StudentUpdateRequest request, Authentication authentication) {
    StudentProfileResponse spr = studentService.updateProfile(request, authentication.getName());
    return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Student updated successfully", spr));
  }

  @GetMapping("/{roll}")
  public ResponseEntity<SuccessResponse<StudentProfileResponse>> getProfileByRollNumber(@PathVariable String roll) {
    StudentProfileResponse spr = studentService.getProfileByRollNumber(roll);
    return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Student retrieved successfully", spr));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("")
  public ResponseEntity<SuccessResponse<Page<StudentProfileResponse>>> getAllStudents(
      @RequestParam(required = false) String department,
      @RequestParam(required = false) String search,
      Pageable pageable) {
    Page<StudentProfileResponse> spr = studentService.getAllStudents(department, search, pageable);
    return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Student retrieved successfully", spr));
  }
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{userId}")
  public ResponseEntity<SuccessResponse<Void>> deleteStudentById(@PathVariable Long userId){
    studentService.deleteStudentById(userId);
    return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "Student deleted successfully"));
  }
}
