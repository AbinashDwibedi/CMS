package com.abinash.campus_management.controller;

import com.abinash.campus_management.dto.LoginResponse;
import com.abinash.campus_management.dto.MyUserDto;
import com.abinash.campus_management.dto.MyUserLoginDto;
import com.abinash.campus_management.dto.SuccessResponse;
import com.abinash.campus_management.services.JwtService;
import com.abinash.campus_management.services.MyUserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class UserAuth {
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager manager;
    private final MyUserService myUserService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<SuccessResponse<MyUserDto>> register(@Valid @RequestBody MyUserDto userDto) {

        MyUserDto registeredUser = myUserService.registerUser(userDto);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "user created successfully", registeredUser));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<SuccessResponse<Void>> deleteUser(Authentication authentication,
            HttpServletResponse response) {
        myUserService.deleteUser(authentication.getName());
        Cookie cookie = new Cookie("jwt", null);
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(false);
        response.addCookie(cookie);
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "User deleted successfully", null));
    }

    @PostMapping("/login")
    public ResponseEntity<SuccessResponse<LoginResponse>> login(@RequestBody MyUserLoginDto userDto,
                                                                HttpServletResponse response) {
        Authentication authentication = manager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userDto.getName(),
                        userDto.getPassword()));
        String token = jwtService.generateToken(userDto.getName());
        Cookie cookie = new Cookie("jwt", token);
        cookie.setMaxAge(24 * 60 * 60 * 10);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");

        response.addCookie(cookie);
        List<String> roles = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
        boolean isProfileComplete = myUserService.isProfileComplete(authentication.getName());
        return ResponseEntity.ok(new SuccessResponse<>(HttpStatus.OK, "login successfully", new LoginResponse(authentication.getName(),roles.getFirst(),isProfileComplete)));
    }

    @PostMapping("/logout")
    public ResponseEntity<SuccessResponse> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setSecure(false);

        response.addCookie(cookie);
        return ResponseEntity.ok(new SuccessResponse(HttpStatus.OK, "logout successfully", null));
    }

    @GetMapping("/test")
    public ResponseEntity<String> testBackend(Authentication authentication) {
        return ResponseEntity.ok("Backend is properly working" + authentication.toString());
    }
}
