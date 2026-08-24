package com.abinash.campus_management.services;

import com.abinash.campus_management.entity.MyUser;
import com.abinash.campus_management.repository.MyUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {
    private final MyUserRepository myUserRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
       MyUser myUser = myUserRepository.findByName(username).orElseThrow(()-> new UsernameNotFoundException("User not found"));
       return new User(
               myUser.getName(),
               myUser.getPassword(),
               List.of(new SimpleGrantedAuthority(myUser.getAuthorities().toString()))
       );
    }
}
